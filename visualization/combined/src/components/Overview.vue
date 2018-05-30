<template>
  <div id="overview">
    <div class="flexrow">
      <div class="infoblock">
        <h2>Flight:</h2>
        <h1>Mestral</h1>
      </div>
      <div class="infoblock">
        <h2>Date:</h2>
        <h1>2017-11-14</h1>
      </div>
      <div class="infoblock">
        <h2>Max Alt:</h2>
        <h1>{{ max_alt.toFixed(2) }}m</h1>
      </div>
    </div>

    <br>

    <PlaybackControls/>

    <br>
    <br>

    <div class="grid">
      <div class="panel">
        <!-- <Visualization class="fill"/> -->
      </div>
      <div class="panel">
        <h3>Events</h3>
        <Eventlist/>
      </div>
      <div class="panel area-c">
        <Graph title="Altitude"></Graph>
        <Graph title="Temperature"></Graph>
        <Graph title="Temperature"></Graph>
      </div>
    </div>

    <br><br>

  </div>
</template>

<script>

import Graph from './Graph.vue';
import Eventlist from './Eventlist.vue';
// import Visualization from './Visualization.vue';
import { EventBus } from '../event-bus.js';
import PlaybackControls from './PlaybackControls.vue';

export default {
  components: {
    'Graph': Graph,
    'Eventlist': Eventlist,
    // 'Visualization': Visualization,
    'PlaybackControls': PlaybackControls,
  },
  name: 'Overview',
  data () {
    return {
      max_alt: 0,
    }
  },
  mounted () {
    EventBus.$on('new-data', this.updateMax);
    EventBus.$on('reset-views', () => {this.max_alt = 0;});
  },
  methods: {
    updateMax(data){
      data.forEach(frame => {
        this.max_alt = Math.max(this.max_alt, frame.pos.z);
      });
    }
  }
}
</script>

<style scoped>
#overview{
  color: #CECECE;
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
  padding: 0 10px;
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
  color: #868686;
  padding-right: 20px;

}
.infoblock h2{
  margin-bottom: 0px;
}
.infoblock h1{
  font-size: 45px;
  font-weight: 300;
  margin-top: 0px;
}


@media(max-width: 1000px){
  .grid{
    grid-template-columns: 1fr 0.5fr;
    grid-template-areas: 
        "a b"
        "c c";
  }

  .area-c{
    grid-area: c;
  }

  .panel{
    min-height: 600px;
  }

}
</style>
