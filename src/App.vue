<template>
</template>

<script setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'
import { GUI } from 'dat.gui'
import { createSphereSkybox } from '@/App.js'
import { modelsImport } from '@/lib/tool.js'
const gui = new GUI()

const scene = new THREE.Scene()
const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
const renderer = new THREE.WebGLRenderer({ canvas })

let mixer = null

modelsImport('models/dog/source/animation-10-Rover.glb', 'models/fairy_forest.glb').then(([dog, forest]) => {
  dogLoadSuccess(dog)
  forestLoadSuccess(forest)
  run(0)
})

createSphereSkybox(scene)


const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000) // 创建透视相机
camera.position.set(2,2,2)
var target = new THREE.Vector3(0, 0.25, 0);
camera.lookAt(target)


// const cylinderGeometry = new THREE.CylinderGeometry( 2, 2, 40, 8, 12 );
// const material = new THREE.MeshPhongMaterial({skinning: true});
// const mesh = new THREE.SkinnedMesh(cylinderGeometry, material)
// scene.add( mesh );

function dogLoadSuccess(gltf) {
  var model = gltf.scene;
  model.scale.set(0.3,0.3,0.3)
  scene.add(model);

  model.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true; 
      // child.material = new THREE.MeshStandardMaterial({  wireframe: false });
      child.receiveShadow = true; // 模型接收阴影
    }
  });

  // const dcontrols = new DragControls( model, camera, renderer.domElement );
  // dcontrols.addEventListener( 'dragstart', function ( event ) {
  //   event.object.material.emissive.set( 0xaaaaaa );
  //   console.log(event);
  // } );
  // dcontrols.addEventListener( 'dragend', function ( event ) {
  //   event.object.material.emissive.set( 0x000000 );
  // } );

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
  gui.add(model.position, 'x', -10, 10, 0.01)
  gui.add(model.position, 'y', -10, 10, 0.01)
  gui.add(model.position, 'z', -10, 10, 0.01)
  scene.add(model);

  model.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true; 
      // child.material = new THREE.MeshStandardMaterial({  wireframe: false });
      child.receiveShadow = true; // 模型接收阴影
    }
  });
}

var directionaLight = new THREE.DirectionalLight(0xffffff, 1);
directionaLight.position.set(10, 10, 0);
directionaLight.castShadow = true; // 启用阴影投射
scene.add( directionaLight );  

const light = new THREE.AmbientLight( 0x404040, 2 ); // 柔和的白光
scene.add( light );  

// const spotLight = new THREE.SpotLight( 0xffffff, 1 );
// spotLight.position.set( 0, 5, 5 );
// scene.add(spotLight);
// spotLight.castShadow = true; // 开启阴影
directionaLight.shadow.mapSize.width = 1024;
directionaLight.shadow.mapSize.height = 1024;
directionaLight.shadow.camera.near = 0.1;
directionaLight.shadow.camera.far = 50;
directionaLight.shadow.radius = 10
directionaLight.shadow.bias = -0.001;
// const canvas = document.createElement('canvas')
// document.body.appendChild(canvas)
// const renderer = new THREE.WebGLRenderer({ canvas }) // 创建渲染器
renderer.setSize(window.innerWidth, window.innerHeight) // 设置渲染器尺寸
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
// run()

// tool

</script>

<style scoped lang="scss">
</style>