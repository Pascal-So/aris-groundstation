<template>
  <div class="playback-controls">
    <h2>
      <span @click="play_pause">
        <span v-if="!playing">▶</span>
        <span v-if="playing">▮▮</span>
      </span>

      T+04.38s
    </h2>
    <div class="bar-placeholder-outer">
      <div class="bar-placeholder-inner"></div>
    </div>
  </div>
</template>

<script>

import { EventBus } from '../event-bus.js';

export default {
  name: 'PlaybackControls',
  data () {
    return {
      playing: true,
    }
  },
  methods: {
    play_pause() {
      if(this.playing){
        EventBus.$emit('pause');
        this.playing = false;
      }else{
        EventBus.$emit('play');
        this.playing = true;
      }
    }
  }
}
</script>

<style scoped>
.playback-controls{
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
</style>
