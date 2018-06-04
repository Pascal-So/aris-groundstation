<template>
  <div ref="visualization" class="visualization">
    
  </div>
</template>

<script>

import RocketViz from '../visualization.js';

import { EventBus } from '../event-bus.js';

export default {
  name: 'Visualization',
  data () {
    return {
      rocketviz: null,
    }
  },
  mounted () {
    this.rocketviz = new RocketViz(this.$refs.visualization);

    
    EventBus.$on('new-data', this.updateRocketViz);
    EventBus.$on('reset-views', this.rocketviz.reset);
    EventBus.$on('change-playback-time', this.rocketviz.reset);
  },
  methods: {
    updateRocketViz (data) {
      this.rocketviz.addData(data);
    }
  }
}
</script>

<style scoped>

</style>
