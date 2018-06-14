<template>
  <div id="status-display">
    <h3>Status</h3>
    <table style="width:100%">
      <tr>
        <td>GPS 1</td>
        <td align="right" v-html="gpsFormat(gps1)"></td>
      </tr>
      <tr>
        <td>GPS 2</td>
        <td align="right" v-html="gpsFormat(gps2)"></td>
      </tr>

      <br>
      <tr v-for="key in Object.keys(status)">
        <td>{{ statusName(key) }}</td>
        <td align="right" :style="{color: statusColor(key)}">{{ statusString(key) }}</td>
      </tr>
    </table> 
  </div>
</template>

<script>

import { EventBus } from '../event-bus.js';

const null_status = {
  pl_on: null,
  pl_alive: null,
  wifi_status: null,
  sensor_status: null,
  sd_status: null,
  control_status: null,
};

export default {
  name: 'StatusDisplay',
  data () {
    return {
      status: null_status,
      gps1: null,
      gps2: null,
    };
  },
  mounted () {
    EventBus.$on('new-data', this.newData);
    EventBus.$on('reset-views', this.reset);
  },
  methods: {
    gpsFormat(coords) {
      if(coords === null){
        return '??';
      }

      if(coords.length != 21){
        // unknown format. don't bother trying to format it.
        return coords;
      }

      // GPS coords format received from the rocket:
      // ddmm.mmmmNdddmm.mmmmW
      // (according to Raphael)

      const deg_lat = coords.substr(0,2);
      const rest_lat = coords.substr(2,8);
      const deg_long = coords.substr(10,3);
      const rest_long = coords.substr(13,8);

      return `${deg_lat}°${rest_lat},&nbsp;${deg_long}°${rest_long}`;
    },
    newData (data) {
      if(data.length === 0) return;

      const frame = data[data.length - 1];

      this.status.pl_on = frame.status.pl_on;
      this.status.pl_alive = frame.status.pl_alive;
      this.status.wifi_status = frame.status.wifi_status;
      this.status.sensor_status = frame.status.sensor_status;
      this.status.sd_status = frame.status.sd_status;
      this.status.control_status = frame.status.control_status;

      this.gps1 = frame.gps1;
      this.gps1 = frame.gps2;
    },
    reset () {
      this.status = null_status;
      this.gps = null_gps;
    },
    statusString (key) {
      switch(this.status[key]){
        case null:
          return '??';
        case 0:
          return '✕';
        case 1:
          return '✓';
      }
    },
    statusColor(key) {
      switch(this.status[key]){
        case null:
          return '#444';
        case 0:
          return '#d63535';
        case 1:
          return '#81ed53';
      }
    },
    statusName(key) {
      switch(key){
        case 'pl_on':
          return 'Payload Activated';
        case 'pl_alive':
          return 'Payload Alive';
        case 'wifi_status':
          return 'Wifi Status';
        case 'sensor_status':
          return 'Sensor Status';
        case 'sd_status':
          return 'SD Status';
        case 'control_status':
          return 'Control Status';
      };

      return '??';
    },
  }
}
</script>

<style scoped>
#status-display{
  padding: 0 12px;
}

table { 
  border-collapse: collapse; 
}

tr {
  border-bottom: 1px solid #444;
}
</style>
