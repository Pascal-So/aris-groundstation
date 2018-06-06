<template>
  <div class="playback-controls">
    <h2>
      <span @click="play_pause" class="play-button">
        <span v-if="!playing">▶</span>
        <span v-if="playing">▮▮</span>
      </span>

      {{ renderTime(playback_time) }}
    </h2>
    <div class="bar-outer" @click="clicked_bar" @mouseleave="leave_bar" @mousemove="hover_bar">
      <div class="hover-box" v-if="hovering_bar" :style="{left: `calc(${hovering_percent} - 40px`}"><p>{{ renderTime(hover_time) }}</p></div>
      <div class="bar-inner" :style="{width: playback_progress_percent}"></div>
      <div class="bar-loaded-indicator" :style="{left: loaded_left_percent, right: loaded_right_percent}"></div>
    </div>
  </div>
</template>

<script>

import { EventBus } from '../event-bus.js';
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'PlaybackControls',
  data () {
    return {
      playing: true,
      playback_time: null,
      hovering_bar: false,
      hover_time: null,
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
    },
    clicked_bar(ev) {
      const time_ms = this.calculate_time(ev);

      console.log(`Clicked ${this.renderTime(time_ms)}.`);

      EventBus.$emit('change-playback-time', time_ms);
    },
    leave_bar() {
      this.hovering_bar = false;
    },
    hover_bar(ev) {
      const time_ms = this.calculate_time(ev);
      this.hover_time = time_ms;
      this.hovering_bar = true;
    },
    calculate_time(ev) {
      const targetRect = ev.currentTarget.getBoundingClientRect()

      const x = ev.pageX - targetRect.left;
      const fraction = x / targetRect.width;

      const time = Math.trunc(fraction * this.flight_duration);
      return time;
    },
  },
  computed: {
    playback_progress_percent() {
      if(!this.flight_duration) return null;

      const fraction = this.playback_time / this.flight_duration;

      return (fraction * 100).toString() + '%';
    },
    hovering_percent() {
      if(!this.flight_duration) return null;

      const fraction = this.hover_time / this.flight_duration;

      return (fraction * 100).toString() + '%';
    },
    loaded_left_percent() {
      if(!this.stored_data_range) return '0';

      const fraction = this.stored_data_range.start / this.flight_duration;

      return (fraction * 100).toString() + '%';
    },
    loaded_right_percent() {
      if(!this.stored_data_range) return '0';

      const fraction = 1 - (this.stored_data_range.end / this.flight_duration);

      return (fraction * 100).toString() + '%';
    },
    ...mapState({
      flight_duration: state => state.duration,
    }),
    ...mapGetters({
      stored_data_range: 'storedDataRange',
    }),
  },
  mounted() {
    EventBus.$on('new-data', data => {
      if(data.length == 0) return;

      this.playback_time = data[data.length - 1].time;
    });
    EventBus.$on('change-playback-time', time => {
      this.playback_time = time;
    });
  }
}
</script>

<style scoped>
.hover-box{
  background-color: #5C5C5C;
  border-radius: 2px;
  width: 80px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  position: absolute;
  top: -32px;
  color: black;
}

.hover-box p{
  margin: 0;
  font-size: 0.8rem;
}

.playback-controls{
  text-align: center;
}

.bar-outer{
  height: 13px;
  width: 100%;
  position: relative;
  background-color: #0E0D0F;
}

.bar-outer:hover{
  cursor: pointer;
}

.bar-loaded-indicator{
  position: absolute;
  top: 6px;
  bottom: 0;
  background-color: #363535;
  z-index: 9;
}

.bar-inner{
  top: 4px;
  bottom: 4px;
  left: 0;
  position: absolute;
  background-color: #3db7ed;
  z-index: 10;
}

.play-button:hover{
  cursor: pointer;
}
</style>
