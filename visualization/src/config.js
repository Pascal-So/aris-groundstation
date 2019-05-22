const fetch_port = '8080';
const fetch_url = `${window.location.protocol}//${window.location.hostname}:${fetch_port}`;

export default {
    fetch_port: fetch_port,
    fetch_url: fetch_url, // url without trailing slash

    // See server/config.js for info about the time resolution!
    data_time_resolution: 50, // ms

    // To improve performance, we don't update the view with the
    // frequency specified above, but rather in multiples of it.
    // This was mostly useful for the 3d viz, so now that this is
    // removed, we could probably even choose a value of 1 here.
    // Just see what works and what doesn't.
    data_frames_per_view_update: 2,

    fetch_ahead_time: 10 * 50, // ms
};