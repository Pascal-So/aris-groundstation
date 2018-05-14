<template>
  <div ref="visualization" class="visualization">
    
  </div>
</template>

<script>

import RocketViz from '../visualization.js';

//import Flightdata from '../flightdata/mestral.js';

import { EventBus } from '../event-bus.js';

export default {
  name: 'Visualization',
  data () {
    return {
      rocketviz: null,
      //rocketdata: this.formatIFDBData(Flightdata),
    }
  },
  mounted () {
    this.rocketviz = new RocketViz(this.$refs.visualization);

    /*var i = 0;
    var scope = this;
    function render () {
      //requestAnimationFrame( render );

      const step = 10;
      if (i + step > scope.rocketdata.length) {
        scope.rocketviz.reset();
        i = 0;
      }

      scope.rocketviz.render(scope.rocketdata.slice(i, i + step));
      i += step;
    }

    render();*/

    EventBus.$on('new-data', this.updateRocketViz);

  },
  methods: {
    updateRocketViz (data) {
      this.rocketviz.render(data);
    }

    /*formatIFDBData (ifdb_data) {
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
    }*/
  }
}
</script>

<style scoped>

</style>
