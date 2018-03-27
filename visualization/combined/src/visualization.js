import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6'
import Flightdata from './flightdata/mestral.js';
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

  const MAX_POINTS = 10000;
  const bgcol = 0x121214;

  const rocketOffset = new THREE.Vector3(0,0.9,0);
  const cameraOffset = new THREE.Vector3(1,2,4);

  // only used for now, will be removed later
  var i = 0;
  const rotdata = Flightdata;


  // public methods
  this.animate = () => {
    requestAnimationFrame( scope.animate );
    stats.begin();
    
    var rx, ry, rz, rw;
    var px, py, pz, pz2;

    [rx, ry, rz, rw] = rotdata.results[0].series[1].values[i].slice(1);
    [px, py, pz, pz2, pz2] = rotdata.results[0].series[0].values[i].slice(1);

    [px, py, pz, pz2] = [px || 0, py || 0, pz || 0, pz2 || 0];

    // everyone who ever decided in favour of a y-up coordinate system on anything should be arrested right now
    // https://www.gamedev.net/forums/topic/374728-quaternion-rotation-z-up-to-y-up/?do=findComment&comment=3471926

    //document.getElementById('altitude1').innerHTML = pz.toFixed(2) + 'm';
    //document.getElementById('altitude2').innerHTML = pz2.toFixed(2) + 'm';

    var quat = new THREE.Quaternion(rx, ry, rz, rw);
    if(firstquat === -1){
      firstquat = quat.clone();
      firstquat.inverse();
    }

    //quat.multiply(new THREE.Quaternion(0, 0, -0.7071, 0.7071));
    //quat.premultiply(firstquat);

    quat.multiply(new THREE.Quaternion(0, 0, -0.7071, 0.7071));
    quat.premultiply(new THREE.Quaternion(-0.7071, 0, 0, 0.7071));

    rocket.quaternion.set(quat.x, quat.y, quat.z, quat.w);

    // transform z-up to y-up
    [px, py, pz] = [px, pz, -py];

    var positions = trajectory_line.geometry.attributes.position.array;

    positions[i * 3] = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = pz;
    trajectory_line.geometry.setDrawRange(0, i+1);

    // https://stackoverflow.com/a/36498386 this had me very confused for a while...
    trajectory_line.geometry.computeBoundingSphere();
    trajectory_line.geometry.attributes.position.needsUpdate = true;


    rocket.position.set(px, py, pz);
    rocket.position.add(rocketOffset);

    // camera.position.set(px, py, pz);
    // camera.position.add(cameraOffset);

    controls.update();

    var offset = new THREE.Vector3(0.1, 0, 0).applyQuaternion(camera.quaternion);

    
    ++i;
    i%= rotdata.results[0].series[0].values.length;
    
    renderer.render( scene, camera );

    stats.end();
  }
  
  var scope = this;

  // private methods
  function init(){
    
    console.log(scope.element.clientWidth, 'clientWidth');
    console.log(scope.element.clientHeight, 'clientHeight');

    camera = new THREE.PerspectiveCamera( 70, scope.element.clientWidth / scope.element.clientHeight, 0.01, 100000 );
    camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);
    camera.position.add(cameraOffset);
    camera.rotation.set(-0.4,0,0);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( scope.element.clientWidth, scope.element.clientHeight );
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
    var trajectory_line_positions = new Float32Array( MAX_POINTS * 3 ); // 3 values per vertex
    trajectory_line_geo.addAttribute( 'position', new THREE.BufferAttribute( trajectory_line_positions, 3 ) );
    trajectory_line = new THREE.Line(trajectory_line_geo, line_material);
    trajectory_line.position.set(rocketOffset.x, rocketOffset.y, rocketOffset.z);
    scene.add( trajectory_line );

    // add controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target = rocket.position;
    controls.followTarget = true;
    
    // add stats
    stats = new Stats.Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    scope.element.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize, false );

    scope.element.appendChild( renderer.domElement );
  }
  
  function loadModels(rocket) {
    Object.keys(RocketPartModels).forEach(key => {
      rocket.add(RocketPartModels[key]);
    });
  }

  function onWindowResize() {
    camera.aspect = scope.element.clientWidth / scope.element.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( scope.element.clientWidth, scope.element.clientHeight );
  }

  init();
}

export default RocketViz;