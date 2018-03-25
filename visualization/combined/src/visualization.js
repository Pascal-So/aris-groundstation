import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6'
import Flightdata from './flightdata/mestral.js';
import RocketPartModels from './models/rocket-part-models.js';
const Stats = require('./stats.js');

function RocketViz(element){
  this.element = element;

  this.camera = new THREE.PerspectiveCamera( 70, element.clientWidth / element.clientHeight, 0.01, 100000 );
  this.camera.position.set(1,2,4);// = rocketOffset;
  this.camera.position.add(cameraOffset);
  this.camera.rotation.set(-0.4,0,0);

  this.renderer = new THREE.WebGLRenderer({antialias: true});
  this.renderer.setPixelRatio( window.devicePixelRatio );
  this.renderer.setSize( element.clientWidth, element.clientHeight );
  this.renderer.setClearColor( bgcol );
  this.element.appendChild( renderer.domElement );

  this.scene = new THREE.Scene();

  this.light = new THREE.DirectionalLight({
    color: 0xffffff,
  });
  this.light.position.set(2,5,3);
  this.scene.add(light);

  this.rocket;


  this.controls = new OrbitControls(this.camera);
  this.controls.target = this.rocket.position;
  this.controls.followTarget = true;


  this.firstquat = -1;


  this.MAX_POINTS = 10000;

  this.rocketOffset = new THREE.Vector3(0,0.9,0);
  this.cameraOffset = new THREE.Vector3(1,2,4);

  this.i = 0;

  this.trajectory_line;

  this.bgcol = 0x121214;

  init();
  //animate();

  const rotdata = Flightdata;

  var stats = new Stats.Stats();
  stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );

}

Object.assign(RocketViz.prototype, {

});


function loadModels(rocket) {
  Object.keys(RocketPartModels).forEach(key => {
    rocket.add(RocketPartModels[key]);
  });
}

function addGrid(scene) {
  var gridsize = 100;
  var gridHelper = new THREE.GridHelper( gridsize*10, gridsize, 0x888888, 0x444444 );
  scene.add( gridHelper );
}

function init() {


  rocket = new THREE.Group();
  rocket.scale.multiplyScalar(0.1);
  scene.add(rocket);

  loadModels(rocket);

  var line_material = new THREE.LineBasicMaterial({color: 0xffffff });

  addGrid(scene);

  
  var dashed_line_mat = new THREE.LineDashedMaterial({
    color: 0xcccccc, dashSize: 0.2, gapSize: .1
  });
  var trajectory_line_geo = new THREE.BufferGeometry();
  var trajectory_line_positions = new Float32Array( MAX_POINTS * 3 ); // 3 values per vertex
  trajectory_line_geo.addAttribute( 'position', new THREE.BufferAttribute( trajectory_line_positions, 3 ) );
  trajectory_line = new THREE.Line(trajectory_line_geo, line_material);
  trajectory_line.position.set(rocketOffset.x, rocketOffset.y, rocketOffset.z);

  scene.add( trajectory_line );
  

  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}



function animate() {
  requestAnimationFrame( animate );
  //stats.begin();

  var rx, ry, rz, rw;
  var px, py, pz;

  [rx, ry, rz, rw] = rotdata.results[0].series[1].values[i].slice(1);
  [px, py, pz, pz2, pz2] = rotdata.results[0].series[0].values[i].slice(1);

  [px, py, pz, pz2] = [px || 0, py || 0, pz || 0, pz2 || 0];

  // everyone who ever decided in favour of a y-up coordinate system on anything should be arrested right now
  // https://www.gamedev.net/forums/topic/374728-quaternion-rotation-z-up-to-y-up/?do=findComment&comment=3471926

  document.getElementById('altitude1').innerHTML = pz.toFixed(2) + 'm';
  document.getElementById('altitude2').innerHTML = pz2.toFixed(2) + 'm';

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

  positions = trajectory_line.geometry.attributes.position.array;

  positions[i * 3] = px;
  positions[i * 3 + 1] = py;
  positions[i * 3 + 2] = pz;
  trajectory_line.geometry.setDrawRange(0, i+1);

  // https://stackoverflow.com/a/36498386 this had me very confused for a while...
  trajectory_line.geometry.computeBoundingSphere();
  trajectory_line.geometry.attributes.position.needsUpdate = true;
  trajectory_line.computeLineDistances();


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

export default {};