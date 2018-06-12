<template>
  <div class="eventlist">
    <h3>Events</h3>
    <ul>
      <li v-for="event in events" class="event">
        <p>{{ renderTime(event.time) }}</p>
        <h2>{{ eventText(event.id, event.params) }}</h2>
      </li>
    </ul>
  </div>
</template>

<script>

import { EventBus } from '../event-bus.js';

export default {
  name: 'Eventlist',
  data () {
    return {
      events: [
        {
          id: 10,
          params: [1, 3],
          time: 1.2,
        }
      ]
    }
  },
  mounted () {
    EventBus.$on('new-data', this.newData);
    EventBus.$on('reset-views', this.reset);
    EventBus.$on('change-playback-time', this.reset);
  },
  methods: {
    newData (data) {
    },
    reset () {
      //this.events = [];
    },
    eventText (id, params) {
      // see file `/event_ids.txt`
      var text = '';
      const states = {
        1: 'OFF',
        3: 'READY',
        4: 'PRE LAUNCH',
        5: 'TAKING OFF',
        6: 'BRAKING',
        7: 'APOGEE',
        8: 'DROGUE PARACHUTE',
        9: 'MAIN PARACHUTE',
        10: 'LANDED',
      };
      switch(id){
        case 10:
          text = `Switched from state ${params[0]}: '${states[params[0]]}' to state ${params[1]}: '${states[params[1]]}'.`;
          break;
        case 20:
          text = `Avionics status: ${params}`;
          break;
        case 30:
          text = `Avionics test finisshed. Results: ${params}`;
          break;
      }

      return text;
    },
  }
}
</script>

<style scoped>
  ul{
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  h3{
    padding: 0 5px;
  }

  .eventlist{
    padding: 0 10px;
  }

  .event{
    background-color: #1D1C1F;
    margin: 10px 0;
    padding: 5px 10px;
  }

  .event p, .event h2{
    margin: 5px 0;
  }
</style>
