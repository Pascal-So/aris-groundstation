<template>
  <div id="app">
    <div class="sidebar">
      <header>
          <img src="./assets/arislogo.png" width="140">
      </header>

      <a href="http://localhost:5000" class="menu-entry">RF&nbsp;Interface</a>
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

.menu-entry-active{
    background-color: #1d1c1f;
}

.h1{
    font-size: 40px;
}

.main{
  padding: 10px 10px 0;
}
</style>
