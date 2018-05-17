const Influx = require('influx');
const express = require('express');
const cors = require('cors');

// ################## IFDB magic functions ######################

function selectString(fields, measurement, start_time, end_time){
    const str = `SELECT ${fields.map(name => `first(${name}) as ${name}`).join(', ')} FROM ${measurement} `
        + `WHERE time >= ${start_time} and time < ${end_time} GROUP BY time(50ms) fill(previous) limit 9990`;
    return str;
}

/**
 * Assumes that `fields` is not empty, and that no measurement is called 'time'.
 * @param array fields   [pos: ['x', 'y', 'z'], rot: [...], ...]
 * @return Promise
 */
function runQueries(influx, fields, start_time, end_time){
    const promises = Object.keys(fields).map(key => {
        const query = selectString(fields[key], key, milliToNano(start_time), milliToNano(end_time));
        return influx.query(query)
            .then(data => {
                return {'key': key, 'values': data};
            });
    });

    // getting data from multiple measurements out of influx is not nice
    return Promise.all(promises)
        .then(data => {
            // let's do this like it's good ol' C++
            const k = data.length; // the amount of measurements
            const n = data[0].values.length; // amount of rows (points in time)
            var out = [];
            for(var i = 0; i < n; ++i){
                var values = {};
                values['time'] = nanoToMilli(data[0].values[i].time.getNanoTime());
                for(var j = 0; j < k; ++j){
                    var vals = data[j].values[i];
                    delete vals.time;
                    values[data[j].key] = vals;
                }
                out.push(values);
            }
            return out;
        });
}

function nanoToMilli(nano_timestamp){
    const milli_timestamp = nano_timestamp.substring(0, nano_timestamp.length - 6)
    return milli_timestamp; // TODO should convert this to int
}

function milliToNano(milli_timestamp){
    const nano_timestamp = milli_timestamp + "000000";
    return milli_timestamp;
}

/**
 * Get from db everything between start_time and latest entry in reference
 * field
 * Time coordinate is always data time
 *
 * @param string start_time
 * @return Promise
 */
function getDataRange(start_time = null){
    // reference field from reference table is assumed to be recorded often, so the last timestamp on
    // this record is assumed to be the last timestamp overall (or close to). Same for the first.
    const reference_table = 'pos';
    const reference_field = 'x';

    if(typeof start_time !== 'string' ||
       start_time === '' ||
       !start_time.match(/^[0-9]+$/)){

        start_time = null
    }

    var promise_start = null;

    if(start_time === null){
        promise_start = influx.query(`SELECT first(${reference_field}) FROM ${reference_table}`)
            .then(result => {
                if(result.length == 0){
                    return Promise.reject(new Error('No data in db'));
                }

                return result[0].time.getNanoTime();
            });
    }else{
        promise_start = new Promise((res, rej) => res(start_time));
    }
    const promise_end = influx.query(`SELECT last(${reference_field}) FROM ${reference_table}`);

    return Promise.all([promise_start, promise_end])
        .then(promise_results => {
            start_time = promise_results[0];
            const end_time = promise_results[1][0].time.getNanoTime();
            //console.log('start_time end_time', start_time, end_time);

            const fields = {
                'pos': ['x', 'y', 'z'],
                'rot': ['x', 'y', 'z', 'w']
            };

            return runQueries(influx, fields, start_time, end_time);
        });
}


const influx = new Influx.InfluxDB({
  host: 'localhost',
  database: 'flight',
  schema: [
    {
      measurement: 'pos',
      fields: {
        x: Influx.FieldType.Float
      },
      tags: []
    }
  ]
});


// ##################### Server config #####################
const PORT = 8080;
const HOST = '0.0.0.0';

const send_max_frames = 10000;
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

function keepStateUpdated(){
    let current_server_time = Date.now(); // server time in ms timestamp
    let update_server_time = state.acquired_data_server_time + keep_data_duration;
    if((state.data === null || current_server_time > update_server_time) && !state.updating){
        // update state
        console.log('Updating cached flight data with new data from IFDB.');
        state.updating = true;

        const range = cachedDataRange();
        const last_data_time = range ? range.end : null;
        
        getDataRange(last_data_time).then(data => {
            state.acquired_data_server_time = Date.now();
            state.data = data;
            state.updating = false;
        });
    }else{
        // do nothing, we still have relatively fresh data in cache
    }
}



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
    }
}
*/


const app = express();
app.use(cors());
app.get('/get-data', (req, res) => {

    if(use_cache) keepStateUpdated();

    console.log(req.query);

    // inclusive start of requested time interval, given in data time coordinates
    const start_data_time = req.query.start;

    console.log(`Received request for data form ${start_data_time}.`);

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
                //info: {
                    //newer_data_available: (response_data.length > send_max_frames),
                //},
            }

            res.json(response);
            return;
        }
    }
    // fetch data from older time range for this request
    getDataRange(start_data_time).then(response_data => {
        console.log(`Sending ${response_data.length} back`);
        res.json({
            data: response_data, //.slice(send_max_frames),
            info: {
                requested_start: start_data_time,
            },
        });
    }).catch(error => {
        console.log(error.message);
        /*res.json({
            error: error,
        })*/
    });
});

app.get('/get-newest', (req, res) => {
    // todo
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
