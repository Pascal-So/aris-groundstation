<template>
  <div id="overview">
    <div class="infoblock">
      <h3>Flight:</h3>
      <h2>{{ prettyFlightName(database) }}</h2><br>
      <router-link :to="{name: 'FlightSelection'}" exact-active-class="menu-entry-active">Other Flights</router-link>
    </div>

    <div class="playback-fixed">
      <PlaybackControls/>
    </div>

    <br>

    <div class="grid">
      <div class="panel scrollpanel area-graph">
        <Graph title="Altitude (sensor fusion)" dataset="fusion_alt"></Graph>
        <Graph title="Vertical Velocity (sensor fusion)" dataset="fusion_vel"></Graph>
        <Graph title="Airbrake u" dataset="brk_u"></Graph>
        <!-- <Graph title="Temperature (barometer 1)" dataset="bar1_temp"></Graph> -->
        <br><br>
      </div>
      <div class="panel scrollpanel area-graph2">
        <Graph title="Acceleration magnitude (accelerometer 1)" dataset="acceleration"></Graph>
      </div>

      <div class="panel scrollpanel area-status">
        <StatusDisplay/>
      </div>

      <!-- <div class="panel area-viz">
        <Visualization class="fill"/>
      </div> -->
      <!-- <div class="panel scrollpanel area-event">
        <Eventlist/>
      </div> -->
    </div>

    <br>
  </div>
</template>

<script>

import Graph from './Graph.vue';
// import Eventlist from './Eventlist.vue';
// import Visualization from './Visualization.vue';
import { EventBus } from '../event-bus.js';
import PlaybackControls from './PlaybackControls.vue';
import StatusDisplay from './StatusDisplay.vue';
import PlaybackController from '../playback-controller';
import store from '../store'

export default {
  components: {
    'Graph': Graph,
    // 'Eventlist': Eventlist,
    // 'Visualization': Visualization,
    'PlaybackControls': PlaybackControls,
    'StatusDisplay': StatusDisplay,
  },
  name: 'Overview',
  props: ['database'],
  data () {
    return {
      controller: null,
    }
  },
  mounted () {
    this.controller = new PlaybackController(this.database);
  },
  beforeDestroy () {
    store.commit('clear');
    EventBus.$emit('pause');
    this.controller.destroy();
    this.controller = null;
    console.log("destroying Overview Component");
  },
}
</script>

<style scoped>

h1{
  margin: 5px 0;
}

a{
  color: #868686;
  text-decoration-style: dotted;
}

a:visited{
  color: #868686;
}

#overview{
  color: #CECECE;
  padding-bottom: 0;
}

.grid{
  display: grid;
  grid-gap: 8px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 170px 1fr;
  grid-template-areas:
    "graph status"
    "graph graph2";
  grid-auto-rows: auto;
  height: 700px;
}

.area-viz { grid-area: viz; }
.area-event { grid-area: event; }
.area-status { grid-area: status; }
.area-graph { grid-area: graph; }
.area-graph2 { grid-area: graph2; }

.panel{
  border: 3px solid #5C5C5C;
  box-sizing: border-box;
  padding: 0;
  border-radius: 3px;
  position: relative;
  box-shadow: 4px 4px rgba(0,0,0,0.3);
}

.scrollpanel {
  overflow-y: auto;
}

.fill{
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.infoblock{
  color: #bcbcbc;
  padding-right: 20px;
  margin-bottom: 10px;
}
.infoblock h3{
  margin-bottom: 0px;
  font-size: 15px;
  display: inline-block;
}
.infoblock h2{
  font-size: 35px;
  font-weight: 300;
  margin: 0 0 5px;
  display: inline-block;
}

.playback-fixed{
    position: static;
    border: none;
    margin-top: 10px;
}


@media(max-width: 1000px){
  .playback-fixed{
    position: fixed;
    background-color: #151417;
    padding: 0 10px 20px;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 100;
    border-top: 3px solid #0c0c0c;
  }

  #overview{
    padding-bottom: 75px;
  }

  .infoblock h3{
    font-size: 14px;
  }
  .infoblock h2{
    font-size: 25px;
  }

  .grid{
    display: block;
    height: auto;
  }

  .grid .panel {
    margin-bottom: 8px;
  }

  .area-status {
    padding-bottom: 8px;
  }
}

@media(max-width: 530px){
  .infoblock h2{
    font-size: 20px;
  }

  .grid{
    height: 1500px;
  }
}
</style>
