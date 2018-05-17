export default {
    fetch_interval: 1000, // ms
    fetch_url: 'http://localhost:8080', // url without trailing slash

    data_frames_interval = 50, // ms, see influxdb query on server
    data_frames_per_view_update = 2,
};