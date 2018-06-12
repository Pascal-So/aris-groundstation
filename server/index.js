const Influx = require('influx');
const express = require('express');
const cors = require('cors');

const DATA_FRAME_INTERVAL = 50 // ms;

// ################## IFDB magic functions ######################

// construct InfluxDB query string
function selectSensorString(fields, measurement, start_time, end_time){
    const str = `SELECT ${fields.map(name => `last(${name}) as ${name}`).join(', ')} FROM ${measurement} `
        + `WHERE time >= ${start_time} and time <= ${end_time} GROUP BY time(${DATA_FRAME_INTERVAL}ms) fill(previous) limit ${send_max_frames}`;
    return str;
}

function runEventQuery(influx, start_time, end_time){
    return influx.query(`SELECT * from events WHERE time >= ${milliToNano(start_time)} and time <= ${milliToNano(end_time)}.`)
        .then(data => data.map(event_data => {
            return {
                time: nanoToMilli(event_data.time.getNanoTime()),
                id: event_data.id,
                param1: event_data.param1,
                param2: event_data.param2,
            };
        }));
}

/**
 * Assumes that `fields` is not empty, and that no measurement is called 'time'.
 * @param array fields   [pos: ['x', 'y', 'z'], rot: [...], ...]
 * @return Promise
 */
function runSensorQueries(influx, fields, start_time, end_time){
    const promises = Object.keys(fields).map(key => {
        const query = selectSensorString(fields[key], key, milliToNano(start_time), milliToNano(end_time));
        console.log("Running query:", query);
        return influx.query(query);
    });

    // getting data from multiple measurements out of influx is not nice
    return Promise.all(promises)
        .then(data => {
            // let's do this like it's good ol' C++
            const n = data[0].length; // amount of rows (points in time)
            var out = [];
            
            for(var i = 0; i < n; ++i){
                var frame = {};
                frame['time'] = nanoToMilli(data[0][i].time.getNanoTime());
                Object.keys(fields).forEach((key, index) => {
                    frame[key] = {};
                    fields[key].forEach(field => {
                        if(data[index][i]){
                            frame[key][field] = data[index][i][field];
                        }else{
                            frame[key][field] = null;
                        }
                    });
                });
                out.push(frame);
            }
            return out;
        });
}

// nanosecond string to millisecond int
function nanoToMilli(nano_timestamp){
    const milli_timestamp = nano_timestamp.substring(0, nano_timestamp.length - 6)
    return parseInt(milli_timestamp);
}

// millisecond int to nanosecond string
function milliToNano(milli_timestamp){
    const nano_timestamp = milli_timestamp.toString() + "000000";
    return nano_timestamp;
}

// Always rounds down to nearest multiple of granularity. e.g. (194, 50) -> 150
function roundToInterval(value, granularity){
    return value - (value % granularity);
}

/**
 * Get earliest and latest timestamp available for the specified reference table and field.
 * Timestamps in milliseconds, int
 *
 * return Object  {start, end}
 */
function getRangeLimits(){
    // reference field from reference table is assumed to be recorded often, so the last timestamp on
    // this record is assumed to be the last timestamp overall (or close to). Same for the first.
    const reference_table = 'pos';
    const reference_field = 'x';

    const promise_start = influx.query(`SELECT first(${reference_field}) FROM ${reference_table}`);
    const promise_end = influx.query(`SELECT last(${reference_field}) FROM ${reference_table}`);

    return Promise.all([promise_start, promise_end])
        .then(promise_results => {
            if(promise_results[0].length == 0){
                return Promise.reject(new Error('No data in db'));
            }

            const start_time = roundToInterval(nanoToMilli(promise_results[0][0].time.getNanoTime()), DATA_FRAME_INTERVAL);
            const end_time = roundToInterval(nanoToMilli(promise_results[1][0].time.getNanoTime()), DATA_FRAME_INTERVAL);
            return {start: start_time, end: end_time};
        });
}

/**
 * Get from db everything between start_time and end of available range (see getRangeLimits)
 * Time coordinate is in data time, milliseconds
 *
 * @param int start_time
 * @return Promise {'sensors', 'events'}
 */
function getDataRange(range_limits, start_time = null){
    if(typeof start_time !== "number"){
        start_time = null;
    }

    if(start_time === null){
        start_time = range_limits.start;
    }
    const end_time = range_limits.end;

    const sensor_fields = {
        'pos': ['x', 'y', 'z'],
        'rot': ['x', 'y', 'z', 'w'],
        'vel': ['x', 'y', 'z'],
        'acc': ['x', 'y', 'z'],
    };

    const sensors_promise = runSensorQueries(influx, sensor_fields, start_time, end_time);
    const events_promise = runEventQuery(influx, start_time, end_time);

    return Promise.all([sensors_promise, events_promise])
        .then(result => {
            return {
                'sensors': result[0],
                'events': result[1],
            };
        });
}

function connect(database){
    const xyz = {
        x: Influx.FieldType.Float,
        y: Influx.FieldType.Float,
        z: Influx.FieldType.Float,
    };

    influx = new Influx.InfluxDB({
        host: containerized ? 'influx' : 'localhost',
        database: database,
        schema: [
            {
                measurement: 'pos',
                fields: xyz,
                tags: []
            },
            {
                measurement: 'rot',
                fields: {
                    x: Influx.FieldType.Float,
                    y: Influx.FieldType.Float,
                    z: Influx.FieldType.Float,
                    w: Influx.FieldType.Float,
                },
                tags: []
            },
            {
                measurement: 'vel',
                fields: xyz,
                tags: []
            },
            {
                measurement: 'acc',
                fields: xyz,
                tags: []
            },
        ],
    });
}

var influx = null;


// ##################### Server config #####################
const PORT = 8080;
const containerized = true;
const HOST = containerized ? 'data-provider' : '0.0.0.0';

const send_max_frames = 400;
const use_cache = false;


// ###################### THE STATE ###########################
var state = {
    data: null,
    acquired_data_server_time: 0, // timestamp in server time
    updating: true,
};

// larger values for keep_data_duration means more lag for playback, but also
// less refetching from the db. Increase when expecing clients with large ping
// times.
const keep_data_duration = 1000; // millisecond duration

function cachedDataRange(){
    if(state.data === null || state.data.length == 0){
        return null;
    }

    const start = state.data[0].time;
    const end = state.data[state.data.length - 1].time;

    return {
        start: start,
        end: end,
    }
}

/*
uncomment when cache is activated. Now that not every request goes to the same database, we'll have to add a
database distinction. Maybe even figure out a way to detect the actively growing database.

Ideally we'd just scrap the cache if influxdb (and the server this is gonna be running on) can handle the
expected amount of requests.

function keepStateUpdated(){
    let current_server_time = Date.now(); // server time in ms timestamp
    let update_server_time = state.acquired_data_server_time + keep_data_duration;
    if((state.data === null || current_server_time > update_server_time) && !state.updating){
        // update state
        console.log('Updating cached flight data with new data from IFDB.');
        state.updating = true;

        const range = cachedDataRange();
        const last_data_time = range ? range.end : null;
        
        getRangeLimits()
            .then(range_limits => getDataRange(range_limits, last_data_time))
            .then(data => {
                state.acquired_data_server_time = Date.now();
                state.data = data;
                state.updating = false;
            });
    }else{
        // do nothing, we still have relatively fresh data in cache
    }
}
*/


// ############### hanle HTTP requests ##########################

/* response data format
{
    data: [
        {
            pos: {
                x: 5,
                y: 7,
                z: 1,
            },
            ...
        }
    ],
    info: {
        requested_start: 0, // ms
        flight_data_duration: 58000, // ms
    }
}
*/


const app = express();
app.use(cors());
app.get('/get-data', (req, res) => {

    if(use_cache) keepStateUpdated();

    const database = req.query.db;
    if(!database || database == ''){
        console.log(`Request with missing database selection.`);        
        res.status(400);
        res.send('No database selected.');
        return;
    }

    connect(database);

    // inclusive start of requested time interval, given in ms since recording start
    var start_data_time = parseInt(req.query.start);
    if(isNaN(start_data_time)){
        start_data_time = null;
    }

    console.log(`Received request for data form '${start_data_time}', database '${database}'.`);
    /*
    commented out cache functionality to remove distraction for now

    if(use_cache){
        const cached_range = cachedDataRange();
        if(cached_range !== null && start_data_time > cached_range.end){
            // don't have this data yet
            res.json(null);
            return;
        }
        if(cached_range !== null && cached_range.start <= start_data_time){
            const response_data = state.data.filter(frame => {
                // TODO: this part is wrong. We can't just compare the data times here,
                // because these timestamps are stored as strings (might be too big for
                // storing as int), so comparison does not give meaningful results.
                frame.time >= start_time; 
            });

            const response = {
                data: response_data.slice(send_max_frames),
                info: {
                    requested_start: start_data_time,
                },
            }

            res.json(response);
            return;
        }
    }*/


    // fetch data from before cache
    var range_limits = null;
    getRangeLimits()
        .then(limits => {
            range_limits = limits;
            return getDataRange(range_limits, start_data_time + range_limits.start);
        })
        .then(response_data => {
            const adjust_start_lambda = (frame) => {
                frame.time -= range_limits.start;
                return frame;
            };

            const send_sensors_data = response_data.sensors.slice(0, send_max_frames).map(adjust_start_lambda);
            //const send_events_data = response_data.events.map(adjust_start_lambda);

            console.log(`Sending ${send_sensors_data.length} frames of sensor data.`); //, and ${send_events_data.length} events.`);
            res.json({
                data: send_sensors_data,
                //events: send_events_data,
                info: {
                    requested_start: start_data_time,
                    flight_data_duration: range_limits.end - range_limits.start,
                },
            });
        }).catch(error => {
            console.log('Error in getRangeLimits:', error.message);
            res.status(400);
            res.send(error.message);
        });
});

app.get('/get-databases', (req, res) => {
    connect('dummy');
    influx.getDatabaseNames()
        .then(databases => {
            res.json({databases: databases.filter(db => db != '_internal')});
        })
        .catch(error => {
            console.log('Error in getDatabaseNames:', error.message);
        });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
