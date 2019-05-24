const fetch_port = '8080';
const fetch_url = `${window.location.protocol}//${window.location.hostname}:${fetch_port}`;

export default {
    fetch_port: fetch_port,
    fetch_url: fetch_url, // url without trailing slash

    // See server/config.js for info about the time resolution!
    data_time_resolution: 100, // ms

    // To improve performance, we don't update the view with the
    // frequency specified above, but rather in multiples of it.
    // This was mostly useful for the 3d viz, but looking at what
    // the raspberry pi can handle, better don't set a value of
    // 1 just yet :D
    data_frames_per_view_update: 3,

    fetch_ahead_time: 10 * 100, // ms
};
