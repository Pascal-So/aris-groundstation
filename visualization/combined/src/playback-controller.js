import { EventBus } from './event-bus';
import Config from './config';


function PlaybackController(){
    var playing;
    var last_requested_data_time;
    var playback_time; // in milliseconds data time
    var stored_data;
    var server_available_range;

    const view_update_interval = Config.data_frames_interval * Config.data_frames_per_view_update;

    const viewLoop = () => {
        if(!playing){
            return;
        }

        const new_playback_time = playback_time + view_update_interval;

        const range = storedDataRange();
        if(range){
            new_playback_time = Math.min(new_playback_time, range.end);
        }else{
            new_playback_time = playback_time;
        }

        if(range && (playback_time <= range.start || playback_time >= range.end)){
            // we jumped outside the range and are still waiting for the data. Don't do anything.
        }else if(!range || playback_time + Config.fetch_ahead_time > range.end){
            getNewData(range ? range.end : playback_time);
        }else if(range && new_playback_time > playback_time){ // we have data to show
            const show_data = stored_data.filter(frame => {
                return frame.time >= playback_time && frame.time < new_playback_time;
            });
            EventBus.$emit('new-data', data);

            playback_time = Math.max(playback_time, new_playback_time);
        }


        if(playing){
            window.setTimeout(viewLoop, view_update_interval);
        }
    }

    const getNewData = (start_time = null) => {
        if(start_time !== null && last_requested_data_time === start_time){
            // already working on this request. ignore.
            return;
        }
        last_requested_data_time = start_time;
        const url = Config.fetch_url + `/get-data?start=${start_time}`;

        console.log(`Fetching from '${url}'`);

        return fetch(url)
            .then(res => res.json()) // res.json() returns another promise idk parsing is hard i guess
            .then(res => {
                // ignore every response but the one we actually requested.
                if(start_time !== last_requested_data_time){
                    return [];
                }else{
                    server_available_range = res.info.available_range;
                    return res.data;
                }
            })
            .then(mergeData);
    }

    const setupListeners = () => {
        EventBus.$on('change-playback-time', (new_time) => {
            if(server_available_range){
                if(new_time < server_available_range.start || new_time > server_available_range.end){
                    console.log("Tried to jump outside server available range. Correcting to nearest available.");
                    
                    if(new_time > server_available_range.end){
                        new_time = server_available_range.end;
                    }else{
                        new_time = server_available_range.start;
                    }
                }
            }

            playback_time = new_time;
        });

        EventBus.$on('pause', () => {
            playing = false;
            
        });

        EventBus.$on('play', () => {
            playing = true;
            viewLoop();
        });
    }

    const storedDataRange = () => {
        if(stored_data == []){
            return null;
        }

        const start = stored_data[0].time;
        const end = stored_data[stored_data.length - 1].time;
        return {
            start: start,
            end: end
        }
    }

    const mergeData = new_data => {
        if(new_data.length == 0){
            return;
        }

        const new_data_start_time = new_data[0].time;
        const range = storedDataRange();

        if(range !== null && 
            new_data_start_time >= range.start && 
            new_data_start_time <= range.end + Config.data_frames_interval){

            stored_data += new_data.filter(frame => {
                frame.time > range.end;
            });

            return;
        }

        stored_data = new_data;
        playback_time = new_data_start_time;
    }

    const init = () => {
        playing = false;
        playback_time = null;
        stored_data = [];
        server_available_range = null;

        getNewData()
            .then(() => {
                range = storedDataRange();
                playback_time = range ? 
                    range.start : 
                    (server_available_range ?
                        server_available_range.start :
                        null);
                playing = true;
                viewLoop();
            });

        setupListeners();
    }

    init();
}

export default PlaybackController;