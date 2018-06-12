<template>
  <div id="overview">
    <div class="flexrow">
      <div class="infoblock">
        <h3>Flight:</h3>
        <h2>{{ database }}</h2><br>
        <router-link :to="{name: 'FlightSelection'}" exact-active-class="menu-entry-active">Other Flights</router-link>
      </div>
      <div class="infoblock">
        <h3>Max Alt:</h3>
        <h2>{{ max_alt.toFixed(2) }}m</h2>
      </div>
    </div>

    <div class="playback-fixed">
      <PlaybackControls/>
    </div>

    <br>

    <div class="grid">
      <div class="panel area-viz">
        <Visualization class="fill"/>
      </div>
      <div class="panel area-event">
        <Eventlist/>
      </div>
      <div class="panel area-graph">
        <Graph title="Altitude" dataset="altitude"></Graph>
        <Graph title="Vertical Velocity" dataset="velocity_z"></Graph>
        <Graph title="Acceleration magnitude" dataset="acceleration"></Graph>
      </div>
    </div>

    <br><br>

  </div>
</template>

<script>

import Graph from './Graph.vue';
import Eventlist from './Eventlist.vue';
import Visualization from './Visualization.vue';
import { EventBus } from '../event-bus.js';
import PlaybackControls from './PlaybackControls.vue';
import PlaybackController from '../playback-controller';
import store from '../store'

export default {
  components: {
    'Graph': Graph,
    'Eventlist': Eventlist,
    'Visualization': Visualization,
    'PlaybackControls': PlaybackControls,
  },
  name: 'Overview',
  props: ['database'],
  data () {
    return {
      max_alt: 0,
      controller: null,
    }
  },
  mounted () {
    this.controller = new PlaybackController(this.database);

    EventBus.$on('new-data', this.newData);
    EventBus.$on('reset-views', () => {this.max_alt = 0;});
  },
  beforeDestroy () {
    store.commit('clear');
    EventBus.$emit('pause');
    this.controller.destroy();
    this.controller = null;
    console.log("destroying Overview Component");
  },
  methods: {
    newData(new_data){
      new_data.forEach(frame => {
        this.max_alt = Math.max(this.max_alt, frame.pos.z);
      });
    }
  }
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
  padding-bottom: 70px;
}

.grid{
  display: grid;
  grid-gap: 13px;
  grid-template-columns: 1.5fr 1fr 1.5fr;
  grid-auto-rows: auto;
}

.flexrow{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.panel{
  border: 3px solid #5C5C5C;
  box-sizing: border-box;
  padding: 0;
  margin-bottom: 5px;
  border-radius: 3px;
  position: relative;
  box-shadow: 4px 4px rgba(0,0,0,0.3);
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

  .grid{
    grid-template-columns: 1fr 0.6fr;
    grid-template-areas: 
        "a b"
        "c c";
  }

  .area-graph{
    grid-area: c;
  }

  .area-event{
    grid-area: b; 
  }

  .area-viz{
    grid-area: a; 
  }

  .panel{
    min-height: 600px;
  }

  .infoblock h3{
    font-size: 14px;
  }
  .infoblock h2{
    font-size: 25px;
  }
}

@media(max-width: 700px){
  .grid{
    grid-template-columns: 1fr;
    grid-template-areas: 
        "a"
        "b"
        "c";
  }

  .area-graph{
    grid-area: a;
  }

  .area-event{
    grid-area: b; 
  }

  .area-viz{
    grid-area: c; 
  }

  .panel{
    min-height: 500px;
  }
}

@media(max-width: 530px){
  .flexrow{
    flex-direction: column;
  }

  .infoblock h2{
    font-size: 20px;
  }

  .panel{
    min-height: 400px;
  }
}
</style>
