import { EventBus } from './event-bus';
import Config from './config';
import store from './store'

function PlaybackController(database){
    var playing;
    var last_requested_data_time;
    var playback_time; // in milliseconds data time

    const playback_speed = 1.0;

    var viewLoop_timeout_object; // storing the timeout that then calls the next viewLoop iteration

    const view_update_interval = Config.data_frame_interval * Config.data_frames_per_view_update;

    this.destroy = () => {
        destroyListeners();
        window.clearTimeout(viewLoop_timeout_object);
        playing = false;
        playback_time = null;
    }

    const viewLoop = () => {
        // stop other loop instances that might be running. This allows us to just call viewLoop() at
        // any time without causing weird bugs.
        window.clearTimeout(viewLoop_timeout_object);

        if(!playing) return;

        var new_playback_time = playback_time + view_update_interval;

        const range = store.getters.storedDataRange;
        if(range){
            new_playback_time = Math.min(new_playback_time, range.end);
        }else{
            new_playback_time = playback_time;
        }

        if(range && (playback_time < range.start || playback_time > range.end)){
            getNewData(playback_time);
            console.log("jumped outside stored data range:", playback_time);
            // we jumped outside the range and are still waiting for the data.
        }else if(!range || playback_time + Config.fetch_ahead_time > range.end){
            getNewData(range ? range.end : playback_time);
        }else if(range && new_playback_time > playback_time){ // we have data to show
            const show_data = store.state.data.filter(frame => {
                return frame.time >= playback_time && frame.time < new_playback_time;
            });
            EventBus.$emit('new-data', show_data);

            playback_time = Math.max(playback_time, new_playback_time);
        }

        if(playing){
            viewLoop_timeout_object = window.setTimeout(viewLoop, view_update_interval / playback_speed);
        }
    }

    const getNewData = (start_time = null) => {
        if(start_time !== null && last_requested_data_time === start_time){
            // already working on this request. ignore.
            return;
        }
        last_requested_data_time = start_time;
        const url = Config.fetch_url + `/get-data?start=${start_time}&db=${database}`;

        console.log(`Fetching from '${url}'`);

        return fetch(url)
            .then(res => res.json()) // res.json() returns another promise idk parsing is hard i guess
            .then(res => {
                // ignore every response but the one we actually requested.
                if(start_time !== last_requested_data_time){
                    return [];
                }else{
                    //mergeData(res)
                    console.log(`Received data, requested starttime is ${start_time}.`);
                    store.commit('merge', res);
                }
            })
            .catch(err => {
                console.log("fetch error:", err);
                return []; // don't care. viewLoop will automatically retry.
            });
    }

    const pauseEventHandler = () => {
        console.log("paused");
        window.clearTimeout(viewLoop_timeout_object);
        playing = false;
    }

    const playEventHandler = () => {
        console.log("playing");
        playing = true;
        viewLoop();
    }

    const skipEventHandler = (new_time) => {
        if(store.state.duration){
            if(new_time < 0 || new_time > store.state.duration){
                console.log("Tried to jump outside server available flight data. Correcting to nearest available.");
                
                if(new_time > store.state.duration){
                    new_time = store.state.duration;
                }else{
                    new_time = 0;
                }
            }
        }

        playback_time = new_time;
        viewLoop(); // don't wait for next loop iteration
    }

    const setupListeners = () => {
        EventBus.$on('change-playback-time', skipEventHandler);
        EventBus.$on('pause', pauseEventHandler);
        EventBus.$on('play', playEventHandler);
    }

    const destroyListeners = () => {
        EventBus.$off('change-playback-time', skipEventHandler);
        EventBus.$off('pause', pauseEventHandler);
        EventBus.$off('play', playEventHandler);
    }

    /*const mergeData = res => {
        flight_data_duration = res.info.flight_data_duration;
        const new_data = res.data;

        if(new_data.length == 0){
            return;
        }

        const new_data_start_time = new_data[0].time;
        const range = store.getters.storedDataRange;

        if(range !== null && 
            new_data_start_time >= range.start && 
            new_data_start_time <= range.end + Config.data_frame_interval){
            const append_data = new_data.filter(frame => {
                return frame.time > range.end;
            });
            stored_data = stored_data.concat(append_data);
        }else{
            stored_data = new_data;
            playback_time = new_data_start_time;
            // reset views, e.g. clear trajectory line in 3d viz, because we'd have a jump otherwise
            EventBus.$emit('reset-views');
        }

        EventBus.$emit('data-info', {
            flight_data_duration: flight_data_duration,
            stored_data_range: store.getters.storedDataRange,
        });
    }*/

    const init = () => {
        playing = false;
        playback_time = null;
        viewLoop_timeout_object = null;

        getNewData()
            .then(() => {
                const range = store.getters.storedDataRange;
                playback_time = range ? range.start : store.state.duration;
                playing = true;

                if(store.state.duration){
                    EventBus.$emit('time-info', store.state.duration);
                }

                viewLoop();
                //window.setTimeout(() => {playing = false; console.log("stopping playback")}, 500);
            });

        setupListeners();
    }

    init();
}

export default PlaybackController;