import * as THREE from 'three';

import Fins from './fins.json';
import Finsoutline from './finsoutline.json';
import Body from './body.json';
import Bodyoutline from './bodyoutline.json';
import Exhaust from './exhaust.json';
import Exhaustoutline from './exhaustoutline.json';

const bgcol = 0x121214;

const bgmat = new THREE.MeshBasicMaterial({
    color: bgcol
});
const outlinemat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.BackSide
});

const loader = new THREE.JSONLoader();

function load(json, mat) {
    const parsed = loader.parse(json);
    return new THREE.Mesh(parsed.geometry, mat);
}

export default {
    fins: load(Fins, bgmat),
    finsoutline: load(Finsoutline, outlinemat),
    body: load(Body, bgmat),
    bodyoutline: load(Bodyoutline, outlinemat),
    exhaust: load(Exhaust, bgmat),
    exhaustoutline: load(Exhaustoutline, outlinemat),
};
