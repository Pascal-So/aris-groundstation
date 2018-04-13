<template>
  <div ref="visualization" class="visualization">
    
  </div>
</template>

<script>

import RocketViz from '../visualization.js';
import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6'
import Flightdata from '../flightdata/mestral.js';
export default {
  name: 'Visualization',
  data () {
    return {
      rocketviz: null,
      rocketdata: this.formatIFDBData(Flightdata),
    }
  },
  mounted () {
    this.rocketviz = new RocketViz(this.$refs.visualization);

    var i = 0;
    var scope = this;
    function render () {
      requestAnimationFrame( render );

      const step = 10;
      if (i + step > scope.rocketdata.length) {
        scope.rocketviz.reset();
        i = 0;
      }

      scope.rocketviz.render(scope.rocketdata.slice(i, i + step));
      i += step;
    }

    render();

    //this.rocketviz.animate();

  },
  methods: {
    formatIFDBData (ifdb_data) {
      console.log(ifdb_data);

      var out = [];

      ifdb_data.results[0].series[0].values.forEach((arr, i) => {
        var x, y, z, dump;
        [dump, x, y, z] = arr;

        out.push({pos: {x: x, y: y, z: z}});
      });

      ifdb_data.results[0].series[1].values.forEach((arr, i) => {
        var x, y, z, w, dump;
        [dump, x, y, z, w] = arr;

        out[i].rot = {x: x, y: y, z: z, w: w};
      });

      return out;
    }
  }
}
</script>

<style scoped>

</style>
