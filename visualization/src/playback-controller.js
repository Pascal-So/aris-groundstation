import { EventBus } from './event-bus';
import Config from './config';
import store from './store'

function PlaybackController(database){
    var playing;
    var last_requested_data_time;
    var playback_time; // in milliseconds data time

    var last_view_update_hw_timestamp = null;

    const playback_speed = 1.0; // use this for debugging

    var viewLoop_timeout_object; // storing the timeout that then calls the next viewLoop iteration

    const view_update_interval = Config.data_time_resolution * Config.data_frames_per_view_update;

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

        // We check how much time has passed since the last view update, and move the playback
        // time ahead accordingly. If the last hardware timestamp is not saved, we assume that
        // we freshly started playing back or that we skipped to somewhere, so we just use the
        // default time interval of view_update_interval.
        var new_playback_time;
        const current_hw_timestamp = Date.now();
        if (last_view_update_hw_timestamp === null) {
            new_playback_time = playback_time + view_update_interval;
        } else {
            let diff = current_hw_timestamp - last_view_update_hw_timestamp;
            // console.log("hw time diff: ", diff);
            if (diff < 0) {
                console.log("Error: hw time decreased");
                diff = view_update_interval;
            }
            new_playback_time = playback_time + current_hw_timestamp - last_view_update_hw_timestamp;
        }
        last_view_update_hw_timestamp = current_hw_timestamp;

        const range = store.getters.storedDataRange;
        const in_range = range && (playback_time >= range.start && playback_time <= range.end)

        if(range){
            new_playback_time = Math.min(new_playback_time, range.end);
        }else{
            new_playback_time = playback_time;
        }

        if(range && !in_range){
            getNewData(playback_time);
            console.log("jumped outside stored data range:", playback_time);
            // we jumped outside the range and are still waiting for the data.
        }else if(!range || playback_time + Config.fetch_ahead_time > range.end){
            getNewData(range ? range.end : playback_time);
        }

        if(in_range && new_playback_time > playback_time){ // we have data to show
            const show_data = store.state.data.filter(frame => {
                return frame.time >= playback_time && frame.time < new_playback_time;
            });
            EventBus.$emit('new-data', show_data);

            playback_time = Math.max(playback_time, new_playback_time);
            store.commit('setPlaybackTime', playback_time);
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
                    console.log(`Received data, requested starttime is ${start_time}.`);
                    if(start_time === last_requested_data_time){
                        // this is needed because otherwise, playback would never resume if the client
                        // requested more server from the data, but the server doesn't have the data yet.
                        // As a consequence of this, the client will keep trying when reaching the end of
                        // flight, but we don't care about that too much.
                        last_requested_data_time = null;
                    }
                    store.commit('merge', res);
                }
            })
            .catch(err => {
                if (err.toString() != "SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data")
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
        last_view_update_hw_timestamp = null;
        store.commit('setPlaybackTime', playback_time);
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

    const init = () => {
        playing = false;
        playback_time = null;
        viewLoop_timeout_object = null;

        getNewData()
            .then(() => {
                const range = store.getters.storedDataRange;
                playback_time = range ? range.start : store.state.duration;
                store.commit('setPlaybackTime', playback_time);
                playing = true;

                if(store.state.duration){
                    EventBus.$emit('time-info', store.state.duration);
                }

                viewLoop();
            });

        setupListeners();
    }

    init();
}

export default PlaybackController;