import { EventBus } from './event-bus';
import { getNewData } from './data-fetcher';
import Config from './config';


function PlaybackController(){
    var playing;
    var last_requested_time;
    var playback_timer;

    const view_update_interval = Config.data_frames_interval * Config.data_frames_per_view_update;

    const viewLoop = () => {

        const new_playback_time = playback_timer + view_update_interval;

        

        if(playing){
            window.setTimeout(viewLoop, view_update_interval);
        }
    }

    const getNewData = (start_time = null) => {
        const url = Config.fetch_url + `/get-data?start=${start_time}`;

        console.log(`Fetching from '${url}'`);

        return fetch(url)
            .then(res => res.json()) // res.json() returns another promise idk parsing is hard i guess
            .then(res => {
                // ignore every response but the one we actually requested.
                if(start_time !== last_requested_time){
                    return [];
                }else{
                    return res.data;
                }
            });
    }

    const setupListeners = () => {
        EventBus.$on('change-playback-time', (new_time) => {
            playback_timer = new_time;            
        });

        EventBus.$on('stop', () => {
            playing = false;
            
        });

        EventBus.$on('pause', () => {
            playing = false;
            
        });

        EventBus.$on('play', () => {
            playing = true;
            
        });
    }

    const mergeData = new_data => {
        if(new_data.length == 0){
            return;
        }

        if(stored_data.length == 0 || jumped_outside_range){
            stored_data = new_data;
            jumped_outside_range = false;
            return;
        }

        const new_data_start_time = new_data[0].time;
        const oldest = stored_data[0].time;
        const newest = stored_data[stored_data.length - 1].time;

        if(oldest < new_data_start_time && new_data_start_time >= newest + Config.data_frames_interval){
            stored_data += new_data.filter(frame => {
                frame.time > newest;
            });
        }

        console.log("Unreachable state reached: returned data not adjacent to stored range for adjacent request."
            , oldest, newest, new_data_start_time);
    }

    const init = () => {
        playing = true;
        playback_timer = null;

        setupListeners();
    }

    init();
}

export default PlaybackController;