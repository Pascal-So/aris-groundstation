<template>
  <div id="app">
    <div class="sidebar">
      <header>
          <img src="./assets/arislogo.png" width="140">
      </header>

      <br><br>

      <router-link :to="{name: 'Overview'}" class="menu-entry" exact-active-class="menu-entry-active">Overview</router-link>
      <router-link :to="{name: 'Info'}" class="menu-entry" exact-active-class="menu-entry-active">Info</router-link>

      <br><br><br>
      <a href="http://wp.codelis.local" class="menu-entry">Blog</a>
      <a href="http://mw.codelis.local" class="menu-entry">Wiki</a>
    </div>
    <div class="main">
      <router-view/>
      
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
*{
    box-sizing: border-box;
}

header{
    width: 100%;
    text-align: center;
    padding-top: 10px;
}

#app {
  font-family: 'Cutive Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #ddd;
  margin-top: 60px;
}

.sidebar{
  background-color: #100F11;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 180px;
}

.menu-entry{
    display: inline-block;
    width: 100%;
    padding: 10px;
    padding-left: 15px;
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
  position: absolute;
  top: 0;
  left: 200px;
  right: 20px;
  bottom: 0;
}
</style>
