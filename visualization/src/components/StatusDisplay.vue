<template>
  <div id="status-display">
    <h3>Status</h3>
    <table style="width:100%">
      <tr>
        <td>Coordinates</td>
        <td align="right">{{ gpsString }}</td>
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

const null_gps = {
  lat: null,
  long: null,
};

export default {
  name: 'StatusDisplay',
  data () {
    return {
      status: null_status,
      gps: null_gps,
    };
  },
  mounted () {
    EventBus.$on('new-data', this.newData);
    EventBus.$on('reset-views', this.reset);
  },
  computed: {
    gpsString() {
      if(this.gps.lat === null || this.gps.long === null){
        return '??';
      }

      const ns = this.gps.lat >= 0 ? `${this.gps.lat}N` : `${-this.gps.lat}S`;
      const ew = this.gps.long >= 0 ? `${this.gps.long}E` : `${-this.gps.long}W`;
      return `${ns}, ${ew}`;
    },
  },
  methods: {
    newData (data) {
      if(data.length === 0) return;

      const frame = data[data.length - 1];

      this.status.pl_on = 1; //frame.status.pl_on; // || this.status.pl_on;
      this.status.pl_alive = 1; //frame.status.pl_alive; // || this.status.pl_alive;
      this.status.wifi_status = 0; //frame.status.wifi_status; // || this.status.wifi_status;
      this.status.sensor_status = frame.status.sensor_status; // || this.status.sensor_status;
      this.status.sd_status = frame.status.sd_status; // || this.status.sd_status;
      this.status.control_status = frame.status.control_status; // || this.status.control_status;

      this.gps.lat = frame.gps1.lat; // || this.gps.lat;
      this.gps.long = frame.gps1.long; // || this.gps.long;
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
