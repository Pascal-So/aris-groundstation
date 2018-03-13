const Influx = require('influx');
const express = require('express');


function selectString(fields, measurement, start_time, end_time){
    const str = `SELECT ${fields.map(name => `first(${name}) as ${name}`).join(', ')} FROM ${measurement} `
        + `WHERE time > ${start_time} and time < ${end_time} GROUP BY time(50ms) fill(previous) limit 10000`;
    return str;
}

// assumes that `fields` is not empty, and that no
// measurement is called 'time'
function runQueries(influx, fields, start_time, end_time){
    const promises = Object.keys(fields).map(key => {
        const query = selectString(fields[key], key, start_time, end_time);
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
                values['time'] = data[0].values[i].time.getNanoTime();
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

/**
 * Get from db everything between start_time and latest entry in reference field.
 *
 * @param string start_time
 * @return Promise
 */
function getNewData(start_time = null){
    // reference field from reference table is assumed to be recorded often, so the last timestamp on
    // this record is assumed to be the last timestamp overall (or close to). Same for the first.
    const reference_table = 'pos';
    const reference_field = 'x';

    if(start_time && !start_time.match(/^[0-9]+$/)){
        start_time = null;
    }

    var prom = null;

    if(start_time === null){
        prom = influx.query(`SELECT first(${reference_field}) FROM ${reference_table}`)
            .then(result => {
                if(result.length == 0){
                    return Promise.reject(new Error('No data in db'));
                }

                return result[0].time.getNanoTime();
            });
    }else{
        prom = new Promise((res, rej) => res(start_time));
    }

    return Promise.all([prom, influx.query(`SELECT last(${reference_field}) FROM ${reference_table}`)])
        .then(results => {
            start_time = results[0];
            end_time = results[1][0].time.getNanoTime();

            const fields = {
                'pos': ['x', 'y', 'z'],
                'rot': ['x', 'y', 'z', 'w']
            };

            return runQueries(influx, fields, start_time, end_time);
        });
}

function fixTimestamps(data){
    data.map(row => {
        row.time = row.time.getNanoTime();
    });
}

const influx = new Influx.InfluxDB({
  host: '159.89.2.225',
  database: 'sim',
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


// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/getdata', (req, res) => {
    const start_time = req.query.start;
    getNewData(req.query.start).then(data => {
        console.log(`Requested with start time ${start_time}, returned ${data.length} rows.`);
        
        res.json(data.slice(-2000));
    });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
