// const fetch_port = '8080';
// const fetch_url = `${window.location.protocol}//${window.location.hostname}:${fetch_port}`;
const fetch_url = 'http://data.localhost:8080';

export default {
    fetch_url: fetch_url, // url without trailing slash

    // See server/config.js for info about the time resolution!
    data_time_resolution: 100, // ms

    // To improve performance, we don't update the view with the
    // frequency specified above, but rather in multiples of it.
    // This was mostly useful for the 3d viz, but looking at what
    // the raspberry pi can handle, better don't set a value of
    // 1 just yet :D
    data_frames_per_view_update: 2,

    fetch_ahead_time: 10 * 100, // ms

    // Data that is more than this amount of time behind the
    // current playback position will be removed from the store.
    // This means that the graphs only show at most this much
    // data, as the currently loaded data ahead of the playback
    // position is not displayed in the graphs.
    keep_data_time: 15 * 1000, // ms

    // see file `/event_ids.txt`
    states: {
        // 2019 events
        0: 'READY',
        1: 'CALIBRATING',
        2: 'PRELAUNCH',
        3: 'TAKING OFF',
        4: 'BRAKING',
        5: 'APOGEE',
        6: 'LANDED',

        // 2018 events:
        // 1: 'OFF',
        // 3: 'READY',
        // 4: 'PRE LAUNCH',
        // 5: 'TAKING OFF',
        // 6: 'BRAKING',
        // 7: 'APOGEE',
        // 8: 'DROGUE PARACHUTE',
        // 9: 'MAIN PARACHUTE',
        // 10: 'LANDED',
    },
};
