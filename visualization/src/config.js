const fetch_port = '8080';
const fetch_url = `${window.location.protocol}//${window.location.hostname}:${fetch_port}`;

export default {
    fetch_port: fetch_port,
    fetch_url: fetch_url, // url without trailing slash

    data_frame_interval: 50, // ms, see influxdb query on server
    data_frames_per_view_update: 2,
    fetch_ahead_time: 30 * 50, // ms
};