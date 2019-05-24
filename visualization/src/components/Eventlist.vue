<template>
  <div id="eventlist">
    <h3>Events</h3>
    <ul>
      <li v-for="event in events" class="event">
        <p>{{ renderTime(event.time) }}</p>
        <h2>{{ eventText(event.id, event.param1, event.param2) }}</h2>
      </li>
    </ul>
  </div>
</template>

<script>

import { mapState } from 'vuex';
import Config from '../config';

export default {
  name: 'Eventlist',
  data () {
    return {
    };
  },
  computed: {
    ...mapState({
      events: state => state.events,
    }),
  },
  methods: {
    eventText (id, param1, param2) {
      var text = '';
      switch(id){
        case 10:
          text = `State '${Config.states[param2]}' -> '${Config.states[param1]}'`;
          break;
        case 30:
          text = `Avionics test finisshed. Results: ${param1}, ${param2}`;
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

  h2{
    font-size: 17px;
  }

  #eventlist{
    padding: 0 10px;
  }

  .event{
    background-color: #1D1C1F;
    margin: 5px 0;
    padding: 3px 10px;
    border: 1px solid #222;
  }

  .event p, .event h2{
    margin: 3px 0;
  }
</style>
