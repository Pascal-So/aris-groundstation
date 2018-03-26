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
        <h1>376.62m</h1>
      </div>
    </div>

    <br>

    <div class="playback">
      <h2>T+04.38s</h2>
      <div class="bar-placeholder-outer">
        <div class="bar-placeholder-inner"></div>
      </div>
    </div>

    <br>
    <br>

    <div class="grid">
      <div class="panel">
        <Visualization class="fill"/>
      </div>
      <div class="panel">
        <Graph title="Altitude"></Graph>
        <Graph title="Temperature"></Graph>
        
      </div>
      <div class="panel">
        <h3>Events</h3>
        <Eventlist/>
      </div>
    </div>

    <br><br>

  </div>
</template>

<script>

import Graph from './Graph.vue';
import Eventlist from './Eventlist.vue';
import Visualization from './Visualization.vue';

export default {
  components: {
    'Graph': Graph,
    'Eventlist': Eventlist,
    'Visualization': Visualization,
  },
  name: 'Overview',
  data () {
    return {
      
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
  grid-template-columns: 1.5fr 1.5fr 1fr;
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
  bottom: 10px;
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

.playback{
  text-align: center;
}

.bar-placeholder-outer{
  height: 10px;
  width: 100%;
  position: relative;
  background-color: #0E0D0F;
}

.bar-placeholder-inner{
  top: 3px;
  bottom: 3px;
  width: 60%;
  position: absolute;
  background-color: #5C5C5C;
}

@media(max-width: 1000px){
  .grid{
    grid-template-columns: 1fr;
  }

}
</style>
