const running_in_docker = true;

module.exports = {
    port: 8080,
    host: running_in_docker ? 'data-provider' : '0.0.0.0',
    influx_host: running_in_docker ? 'influx' : 'localhost',

    // Max amount of data frames to send to frontend for
    // one request. Can set this to a low value if the client
    // is always on the same network.
    send_max_frames: 200,

    // The time duration for one data frame. Increase value
    // to improve performance, decrease to improve accuracy of
    // displayed values. Unit is milliseconds.
    // NOTE: Change value in visualization/src/config.js to the
    // same value!
    data_time_resolution: 100 // ms
};
