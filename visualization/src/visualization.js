import * as THREE from 'three';
import OrbitControls from './OrbitControls.js'; //'orbit-controls-es6'
import RocketPartModels from './models/rocket-part-models.js';
const Stats = require('./stats.js');

function RocketViz(element){
  
  // public variables
  this.element = element;

  // private variables
  var camera;
  var renderer;
  var scene;
  var light;
  var rocket;
  var controls;
  var trajectory_line;
  var stats;
  var firstquat = -1;

  const USE_STATS = false;

  const MAX_TRAIL_POINTS = 10000;
  var current_trail_points = 0;
  const bgcol = 0x151417;

  const rocketOffset = new THREE.Vector3(0,0.9,0);
  const cameraOffset = new THREE.Vector3(1,2,4);

  // only used for now, will be removed later
  // var i = 0;
  // const rotdata = Flightdata;

  /////////// public methods

  /**
   *  Clear data for restarting flight
   */
  this.reset = () => {
    current_trail_points = 0;
  }

  /**
   * Add new data to the visualization, complete the trajectory line up
   * to the current point. All points are added at once, rocket is moved
   * to the last point in array.
   *
   * @param points  the new trajectory points since the last update. 
                    format: [{pos: {x,y,z}, rot: {x,y,z,w}}]
   */
  this.addData = (points) => {
    if(points.length == 0){
      return;
    }

    // convert to y-up
    points = points.map(p => {
      var x,y,z;
      [x,y,z] = [p.pos.x, p.pos.z, -p.pos.y];
      return {pos: {x: x, y: y, z: z}, rot: p.rot};
    });

    // set rocket pos rot

    const latest = points[points.length - 1];

    var quat = new THREE.Quaternion(latest.rot.x, latest.rot.y, latest.rot.z, latest.rot.w);
    if(firstquat === -1){
      firstquat = quat.clone();
      firstquat.inverse();
    }
    quat.multiply(new THREE.Quaternion(0, 0, -0.7071, 0.7071));
    quat.premultiply(new THREE.Quaternion(-0.7071, 0, 0, 0.7071));
    rocket.quaternion.set(quat.x, quat.y, quat.z, quat.w);

    rocket.position.set(latest.pos.x, latest.pos.y, latest.pos.z);
    rocket.position.add(rocketOffset);    

    // update trail

    var positions = trajectory_line.geometry.attributes.position.array;

    if(current_trail_points + points.length > MAX_TRAIL_POINTS){
      // move a bit from the end of the line back to start, discard rest.
      // maybe change this to a smaller fraction if this takes too long.

      var keep_amount = MAX_TRAIL_POINTS / 4;

      // this assumes that MAX_TRAIL_POINTS >> points.length
      for(var i = 0; i < keep_amount; i++){
        const old_idx = 3 * (i + current_trail_points - keep_amount);
        const new_idx = 3 * i;
        positions[new_idx] = positions[old_idx];
        positions[new_idx + 1] = positions[old_idx + 1];
        positions[new_idx + 2] = positions[old_idx + 2];
      }

      current_trail_points = keep_amount;
    }

    points.forEach(p => {
      positions[current_trail_points * 3] = p.pos.x;
      positions[current_trail_points * 3 + 1] = p.pos.y;
      positions[current_trail_points * 3 + 2] = p.pos.z;

      current_trail_points++;
    });
    trajectory_line.geometry.setDrawRange(0, current_trail_points);

    // https://stackoverflow.com/a/36498386 this had me very confused for a while...
    trajectory_line.geometry.computeBoundingSphere();
    trajectory_line.geometry.attributes.position.needsUpdate = true;
  }

  this.render = () => {
    requestAnimationFrame(this.render);

    if(USE_STATS) stats.begin();
    controls.update();
    renderer.render( scene, camera );
    if(USE_STATS) stats.end();
  }

  //////////// private methods

  var scope = this;

  function init(){

    const width = scope.element.clientWidth;
    const height = scope.element.clientHeight;

    console.log(width, 'clientWidth');
    console.log(height, 'clientHeight');

    camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 100000 );
    camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);
    camera.position.add(cameraOffset);
    camera.rotation.set(-0.4,0,0);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    renderer.setClearColor( bgcol );

    scene = new THREE.Scene();

    // add rocket
    rocket = new THREE.Group();
    loadModels(rocket);
    rocket.scale.multiplyScalar(0.1);
    scene.add(rocket);

    // add light
    light = new THREE.DirectionalLight({
      color: 0xffffff,
    });
    light.position.set(2,5,3);
    scene.add(light);

    // add grid
    var gridsize = 100;
    var gridHelper = new THREE.GridHelper( gridsize*10, gridsize, 0x888888, 0x444444 );
    scene.add( gridHelper );

    // add trajectory
    var line_material = new THREE.LineBasicMaterial({color: 0xffffff });
    var trajectory_line_geo = new THREE.BufferGeometry();
    var trajectory_line_positions = new Float32Array( MAX_TRAIL_POINTS * 3 ); // 3 values per vertex
    trajectory_line_geo.addAttribute( 'position', new THREE.BufferAttribute( trajectory_line_positions, 3 ) );
    trajectory_line = new THREE.Line(trajectory_line_geo, line_material);
    trajectory_line.position.set(rocketOffset.x, rocketOffset.y, rocketOffset.z);
    scene.add( trajectory_line );

    // add controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target = rocket.position;
    controls.followTarget = true;
    
    if(USE_STATS){
      // add stats
      stats = new Stats.Stats();
      stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
      scope.element.appendChild( stats.dom );
    }

    window.addEventListener( 'resize', onWindowResize, false );

    scope.element.appendChild( renderer.domElement );

    scope.render();
  }
  
  function loadModels(rocket) {
    Object.keys(RocketPartModels).forEach(key => {
      rocket.add(RocketPartModels[key]);
    });
  }

  function onWindowResize() {
    function actuallyResize(){
      const width = scope.element.clientWidth;
      const height = scope.element.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize( width, height );  
    }

    setTimeout(actuallyResize, 300);
  }

  // We first initialize everything, then after a while check the new dom element dimensions,
  // and resize the visualization. When initially loading the page, the dom element height
  // might not be correct yet, as the graphs and eventlog are affecting it.
  init();
  onWindowResize()
}

export default RocketViz;