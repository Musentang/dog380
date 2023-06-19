<template>
<Com3DBtn class="street-lamp-switch" v-model="switchOpen" />
</template>

<script setup>
import Com3DBtn from '@/components/3DBtn.vue'
import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { createSphereSkybox, initRenderer, initCamera, initLight, initScene, initOrbitControls, randomArr } from '@/App.js'
import { modelsImport } from '@/lib/tool.js'

import { GUI } from 'dat.gui'
const gui = new GUI()

const clock = new THREE.Clock()
let mixer = null
const target = new THREE.Vector3(0, 0.3, 0)

const scene = initScene()
const renderer = initRenderer()
const camera = initCamera(target)
const { directionaLight, hemisphereLight, spotLight } = initLight(scene)
const switchOpen = ref(false)

watch(() => switchOpen.value, val => spotLight.intensity = val ? 1.2 : 0.0)

gui.add(spotLight, 'intensity', 0, 1)
gui.add(spotLight.shadow, 'bias', -0.0001, 2)
gui.add(spotLight.shadow.camera, 'fov', 0, 200)
const orbitControls = initOrbitControls(camera, renderer.domElement, target)
modelsImport('models/dog/source/animation-10-Rover.glb', 'models/fairy_forest.glb').then(([dog, forest]) => {
  dogLoadSuccess(dog)
  forestLoadSuccess(forest)
  // sunMove()
  run(0)
})

createSphereSkybox(scene)

const WAIT_ANIMATIONS = [0,1,3,9] // 待机 0,1,3,9
const INTERACT_ANIMATIONS = [2,5,7,8] // 交互 2,5,7,8
const MOVE_ANIMATIONS = [4,6] // 移动 4,6
let dog380Status = 0 // 0 待机 1 交互 2 移动
let currAction = null
const actions = []
function dogLoadSuccess(gltf) {
  var model = gltf.scene
  model.scale.set(0.3,0.3,0.3)
  scene.add(model)
  model.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true 
      child.receiveShadow = true
    }
  })

  const animations = gltf.animations
  mixer = new THREE.AnimationMixer(model)
  animations.forEach(function (animation) {
    const action = mixer.clipAction(animation)
    action.clampWhenFinished = true
    action.loop = THREE.LoopOnce
    
    actions.push(action)
  })
  mixer.addEventListener('finished', () => {
    if (dog380Status === 1) {
      dog380Status = 0
    }
    currAction.reset().stop()
    const index = randomArr(WAIT_ANIMATIONS, Math.random())
    currAction = actions[index]
    currAction.reset().play()
  })
  currAction = actions[0]
  currAction.play()
}

function forestLoadSuccess(gltf) {
  var model = gltf.scene
  model.position.set(-0.72,-0.83,0)
  // gui.add(model.position, 'x', -10, 10, 0.01)
  // gui.add(model.position, 'y', -10, 10, 0.01)
  // gui.add(model.position, 'z', -10, 10, 0.01)
  scene.add(model)

  model.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true 
      // child.material = new THREE.MeshStandardMaterial({  wireframe: false })
      child.receiveShadow = true // 模型接收阴影
    }
  })
}
sunMove()
function sunMove() {
  new TWEEN.Tween(directionaLight.position).to({
    x: -15
  }, 30000).start().repeat(Infinity)
  
  new TWEEN.Tween(directionaLight).to({
    intensity: 1
  }, 15000).start().repeat(Infinity).easing(TWEEN.Easing.Exponential.In).yoyo(true)
  
  new TWEEN.Tween(hemisphereLight).to({
    intensity: 0.6
  }, 15000).start().repeat(Infinity).easing(TWEEN.Easing.Exponential.In).yoyo(true)
}

function run () {
  stats.begin(); // ======= stats.begin =======

  TWEEN.update()
  mixer.update(clock.getDelta())
  orbitControls.update()
  renderer.render(scene, camera)

  stats.end();    // ======= stats.end =======

  requestAnimationFrame(run)
}

document.addEventListener('click', e => {
  const x = (e.clientX / window.innerWidth) * 2 - 1
  const y = -(e.clientY / window.innerHeight) * 2 + 1
  const standerVec3 = new THREE.Vector3(x, y, 0.5)
  const worldVec = standerVec3.unproject(camera)
  const ray = worldVec.sub(camera.position).normalize()
  const raycaster = new THREE.Raycaster(camera.position, ray)
  const intersects = raycaster.intersectObjects(scene.children, true)

  let ponit3d = null
  if (intersects.length) {
    ponit3d = intersects[0]
  } 
  if (ponit3d) {
    if (ponit3d.object.name === 'Rover') {
      dog380Click(ponit3d.object)
    }
  }
})

function dog380Click() {
  if (dog380Status === 1) return
  currAction.reset().stop()
  dog380Status = 1
  const index = randomArr(INTERACT_ANIMATIONS, Math.random())
  console.log(index)
  currAction = actions[index]
  currAction.play()
}

// helper =========
var axesHelper = new THREE.AxesHelper(5) 
scene.add(axesHelper)

var stats = new Stats();
stats.domElement.style = 'position:fixed;top:0;left:0;z-index:10000;'
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.domElement);
// helper end=========

</script>

<style scoped>
.street-lamp-switch {
  position: fixed;
  right: 0;
  top: 20%;
}
</style>