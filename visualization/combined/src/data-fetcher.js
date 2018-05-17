//import request from 'request';

import { EventBus } from './event-bus.js';
import Config from './config';

const url = Config.fetch_url;

function DataFetcher(ping_interval, callback_function, start_time = null){
    console.log("initializing DataFetcher");
    var interval;
    var time;
    var keep_fetching;
    var callback;
    var timeout;
    var use_results;

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

        // We're not restarting the loop here, because this might lead to
        // bugs if the loop is currently in the fetching phase, because
        // we can't cancle that phase. Set a use_results flag instead, so
        // the callback won't be called with any data ordered from before
        // the start_time was changed.
        // window.clearTimeout(timeout);
        // loop();
        use_results = false;
    }

    this.stop = () => {
        window.clearTimeout(timeout);
        keep_fetching = false;
        use_results = false;
    }

    this.resume = () => {
        if(keep_fetching){
            return;
        }

        keep_fetching = true;
        window.clearTimeout(timeout);
        fetch();
    }

    const getNewData = (start_time = null) => {
        const combined_url = url + `/get-data?start=${start_time}`;

        console.log(`Fetching from '${combined_url}'`);

        return fetch(combined_url)
            .then(res => res.json()); // res.json() returns another promise
    }

    const loop = () => {
        use_results = true;
        getNewData(time)
            .then (response => {
                if(use_results){
                    callback(response);
                }

                if(response.data && response.data.length > 0){
                    const latest_data_time = response.data[response.data.length - 1].time;
                    time = latest_data_time;
                }
            })
            .catch (error => {
                console.log("DataFetcher Error:", error.message);
            })
            .finally (() => {
                if(keep_fetching){
                    window.clearTimeout(timeout);
                    if(use_results){
                        timeout = window.setTimeout(loop, interval);
                    }else{
                        // we ditched the last results because we didn't need them anymore.
                        // get new data asap.
                        timeout = window.setTimeout(loop, 10);
                    }
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

export default DataFetcher;