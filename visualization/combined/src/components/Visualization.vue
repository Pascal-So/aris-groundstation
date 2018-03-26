<template>
  <div ref="visualization" class="visualization">
    
  </div>
</template>

<script>

import RocketViz from '../visualization.js';
import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6'

export default {
  name: 'Visualization',
  data () {
    return {
      rocketviz: null,
    }
  },
  mounted() {
    this.rocketviz = new RocketViz(this.$refs.visualization);
    this.rocketviz.animate();

    // var el = this.$refs.visualization;
    // var camera = new THREE.PerspectiveCamera( 70, el.clientWidth / el.clientHeight, 1, 1000 );
    // camera.position.z = 400;
    // var scene = new THREE.Scene();
    // var geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
    // var material = new THREE.MeshBasicMaterial( { color: '#cea' } );
    // var mesh = new THREE.Mesh( geometry, material );
    // scene.add( mesh );
    // var renderer = new THREE.WebGLRenderer();
    // renderer.setPixelRatio( window.devicePixelRatio );
    // renderer.setSize( el.clientWidth, el.clientHeight );
    // el.appendChild( renderer.domElement );

    // mesh.rotation.x += 0.2;
    // mesh.rotation.y += 0.5;

    // renderer.render( scene, camera );

  }
}
</script>

<style scoped>

</style>
