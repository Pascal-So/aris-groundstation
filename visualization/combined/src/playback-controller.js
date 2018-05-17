import { EventBus } from './event-bus';
import FetchLoop from './data-fetcher';
import Config from './config';


// the timestamps are in nanoseconds and might be too big to store
// as a number, so we have to compare strings.
function compare_data_times(time_a, time_b){
    const maxlen = Math.max(time_a.length, time_b.length);

    time_a = time_a.padStart(maxlen, '0');
    time_b = time_b.padStart(maxlen, '0');

    if(time_a < time_b){
        return -1;
    }else if(time_a === time_b){
        return 0;
    }else{
        return 1;
    }
}

function PlaybackController(){
    var loop;
    var paused;

    var playback_timer;

    const view_update_interval = Config.data_frames_interval * Config.data_frames_per_view_update;

    const setupListeners = () => {
        EventBus.$on('change-playback-time', (new_time) => {
            loop.setTime(new_time);
        });

        EventBus.$on('stop', () => {
            paused = true;
            loop.stop();
        });

        EventBus.$on('pause', () => {
            paused = true;
            loop.stop();
        });

        EventBus.$on('play', () => {
            paused = false;
            loop.resume();
        });
    }

    const mergeData = new_data => {
        if(new_data.length == 0){
            return;
        }

        if(stored_data.length == 0){
            stored_data = new_data;
            return;
        }

        const new_data_start_time = new_data[0].time;
        const oldest = stored_data[0].time;
        const newest = stored_data[stored_data.length - 1].time;

        if(compare_data_times(oldest, new_data_start_time) < 0 && compare_data_times(new_data_start_time, newest) >= 0){
            // 
        }
    }

    const init = () => {
        paused = false;
        playback_timer = null;

        loop = new DataFetcher(Config.fetch_interval, (response) => {
            console.log(`Received ${response.data.length} frames from server.`);

            EventBus.$emit('new-data', response.data);
        });

        setupListeners();
    }


    

    init();
}


export default PlaybackController;