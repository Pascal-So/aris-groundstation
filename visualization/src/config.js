export default {
    fetch_url: 'http://localhost:8080', // url without trailing slash

    data_frame_interval: 50, // ms, see influxdb query on server
    data_frames_per_view_update: 2,
    fetch_ahead_time: 20 * 50, // ms
};