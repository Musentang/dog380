<template>
</template>

<script setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'
import { GUI } from 'dat.gui'
import { createSphereSkybox, initRenderer, initCamera, initLight } from '@/App.js'
import { modelsImport } from '@/lib/tool.js'
// const gui = new GUI()
let mixer = null
const target = new THREE.Vector3(0, 0.3, 0);

const scene = new THREE.Scene()
const renderer = initRenderer()
const camera = initCamera(target)
const { directionaLight, ambientLight } = initLight(scene)

modelsImport('models/dog/source/animation-10-Rover.glb', 'models/fairy_forest.glb').then(([dog, forest]) => {
  dogLoadSuccess(dog)
  forestLoadSuccess(forest)
  run(0)
})

createSphereSkybox(scene)


function dogLoadSuccess(gltf) {
  var model = gltf.scene;
  model.scale.set(0.3,0.3,0.3)
  scene.add(model);

  model.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true; 
      child.receiveShadow = true;
    }
  });

  const animations = gltf.animations
  mixer = new THREE.AnimationMixer(model);
  var actions = [];
  animations.forEach(function (animation) {
    actions.push(mixer.clipAction(animation));
  });
  actions[0].play();
}

function forestLoadSuccess(gltf) {
  var model = gltf.scene;
  model.position.set(-0.72,-0.83,0)
  // gui.add(model.position, 'x', -10, 10, 0.01)
  // gui.add(model.position, 'y', -10, 10, 0.01)
  // gui.add(model.position, 'z', -10, 10, 0.01)
  scene.add(model);

  model.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true; 
      // child.material = new THREE.MeshStandardMaterial({  wireframe: false });
      child.receiveShadow = true; // 模型接收阴影
    }
  });
}

const controls = new OrbitControls( camera, renderer.domElement );
controls.target = target

var prevTime = 0;
function run (currentTime) {
  var deltaTime = (currentTime - prevTime) / 1000; // 将毫秒转换为秒
  prevTime = currentTime;
  mixer.update(deltaTime);
  controls.update();
  renderer.render(scene, camera) // 渲染
  requestAnimationFrame(run)
}

</script>

<style scoped lang="scss">
</style>