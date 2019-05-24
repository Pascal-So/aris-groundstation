<template>
  <div id="status-display">
    <h3>Status</h3>
    <table>
      <tr>
        <td>GPS 1</td>
        <td align="right" v-html="gpsFormat(status.gps1)"></td>
      </tr>
      <tr>
        <td>GPS 2</td>
        <td align="right" v-html="gpsFormat(status.gps2)"></td>
      </tr>
      <tr>
        <td>Temp</td>
        <td align="right">{{Math.round(status.temp * 100) / 100}}°C</td>
      </tr>
      <tr>
        <td>State</td>
        <td align="right" v-html="stateFormat(status.state)"></td>
      </tr>
    </table>

    <!-- for 2019 we're using the status display only for gps, as the other stuff is not transmitted. -->
    <!-- <br>

    <table>
      <tr v-for="key in Object.keys(status)">
        <td>{{ statusName(key) }}</td>
        <td align="right" :style="{color: statusColor(key)}">{{ statusString(key) }}</td>
      </tr>
    </table> -->
  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import { EventBus } from '../event-bus.js';
import Config from '../config';

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
    };
  },
  computed: {
    ...mapGetters([
      'status',
    ]),
  },
  methods: {
    stateFormat(state_id) {
      return Config.states[state_id];
    },
    gpsFormat(coords) {
      if(coords === null){
        return '??';
      }

      if (coords.length == 21 &&
          coords.charAt(4) == '.' &&
          coords.charAt(15) == '.') {
        // 2018 format

        // GPS coords format received from the rocket:
        // ddmm.mmmmNdddmm.mmmmW
        // (according to Raphael)

        const deg_lat = coords.substr(0,2);
        const rest_lat = coords.substr(2,8);
        const deg_long = coords.substr(10,3);
        const rest_long = coords.substr(13,8);
        return `${deg_lat}°${rest_lat},&nbsp;${deg_long}°${rest_long}`;
      } else {
        // 2019 or unknown format
        return coords.replace(/ /g, '&nbsp;');
      }
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
          return 'Payload Active';
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
  width: 100%;
}

tr {
  border-bottom: 1px solid #444;
}
</style>
