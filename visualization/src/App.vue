<template>
  <div id="app">
    <div class="sidebar">
      <header>
          <img src="./assets/arislogo.png" width="140">
      </header>

      <router-link v-if="!running_on_groundstation" class="menu-entry" to="/">Flights</router-link>
      <router-link v-if="!running_on_groundstation" class="menu-entry" to="/about">About</router-link>

      <a v-if="running_on_groundstation" href="http://localhost:5000" class="menu-entry">RF&nbsp;Interface</a>
      <a v-if="running_on_groundstation" :href="grafanaLink" class="menu-entry">Grafana</a>

      <a href="https://aris-space.ch" class="menu-entry">ARIS&nbsp;homepage</a>
    </div>
    <div class="main">
      <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
        running_on_groundstation: true,
    };
  },
  mounted () {
    // we prefer false positives over false negatives here.
    if(window.location.hostname === "aris.pascalsommer.ch"){
        this.running_on_groundstation = false;
    }
  },
  computed: {
    grafanaLink () {
        return `http://${window.location.hostname}:3000`;
    },
  },
}
</script>

<style>
*{
    box-sizing: border-box;
}

header{
    width: 100%;
    text-align: center;
    padding: 10px 0;
}

#app {
  font-family: 'Cutive Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #ddd;
}

.sidebar{
  background-color: #100F11;
  text-align: center;
  padding-bottom: 5px;
}

.menu-entry{
    display: inline;
    padding: 5px 15px;
    text-decoration: none;
    color: #dedede;
}

.router-link-exact-active{
    text-decoration: underline;
    text-decoration-style: dotted;
}


.h1{
    font-size: 40px;
}

.main{
  padding: 10px 10px 0;
}

@media(max-width: 440px){
  .menu-entry{
    display: block;
  }
}

</style>
