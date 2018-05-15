import request from 'request';

import { EventBus } from './event-bus.js';

const url = 'localhost:8080'; // url without trailing slash

function FetchLoop(ping_interval, callback_function, start_time = null){
    var interval;
    var time;
    var keep_fetching;
    var callback;

    this.setInterval = (ping_interval) => {
        if(typeof ping_interval !== 'number' || ping_interval < 0){
            throw new Error('Invalid ping interval');
        }

        interval = ping_interval;
    }

    this.setTime = (start_time) => {
        if(start_time === null){
            time = start_time;
            return;
        }

        if(typeof start_time !== 'string' ||
            start_time === '' ||
            !start_time.match(/^[0-9]+$/)){

            throw new Error('Invalid start time');
        }

        time = start_time;
    }

    this.stop = () => {
        keep_fetching = false;
    }

    const getNewData = (start_time = null) => {
        return new Promise((resolve, reject) => {
            request({
                url: url + `/get-data?start=${start_time}`,
                json: true,
            }, (error, response, body) => {
                if(error){
                    reject(error);
                }else{
                    resolve(body);
                }
            });
        });
    }

    const loop = () => {
        getNewData(time)
            .then (response => {
                callback(response);

                if(response.data && response.data.length > 0){
                    const latest_data_time = response.data[response.data.length - 1].time;
                    time = latest_data_time;
                }
            })
            .catch (error => {
                console.log(error.message);
            })
            .finally (() => {
                if(keep_fetching){
                    window.setTimeout(loop, interval);
                }
            });
    }

    const init = () => {
        if(typeof url !== 'string' || url === ''){
            throw new Error("Invalid server url given.");
        }

        this.setInterval(ping_interval);
        this.setTime(start_time);
        callback = callback_function;
        keep_fetching = true;

        loop();
    }

    init();
}