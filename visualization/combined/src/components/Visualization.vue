<template>
  <div ref="visualization" class="visualization">
    
  </div>
</template>

<script>

import Viz from '../visualization.js';


export default {
  name: 'Visualization',
  data () {
    return {
      rocketviz: null,
    }
  },
  mounted() {
    this.rocketviz = new Viz.rocketviz(this.$refs.visualization);
  }
}
</script>

<style scoped>

</style>
