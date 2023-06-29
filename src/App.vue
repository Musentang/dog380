<template>
<Com3DBtn class="street-lamp-switch" v-model="switchOpen" />
<img class="home-btn" @click="changeScene" src="@/img/home.png" alt="">
</template>

<script setup>
import Com3DBtn from '@/components/3DBtn.vue'
import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { createSphereSkybox, initRenderer, initCamera, initLight, initScene, initOrbitControls, randomArr, calcSunXYZ } from '@/App.js'
import { modelsImport } from '@/lib/tool.js'
import {snowScene} from './packages/snow.js'
import dayjs from 'dayjs'
import { GUI } from 'dat.gui'
const gui = new GUI()

const clock = new THREE.Clock()
let mixer = null
const CAMERA_TARGET = new THREE.Vector3(0, 0.3, 0)

const scene = initScene()
const renderer = initRenderer()
const camera = initCamera(CAMERA_TARGET)
const { directionaLight, hemisphereLight, spotLight } = initLight(scene)
const switchOpen = ref(false)
snowScene(scene)

watch(() => switchOpen.value, val => spotLight.intensity = val ? 1.2 : 0.0)

const orbitControls = initOrbitControls(camera, renderer.domElement, CAMERA_TARGET)
modelsImport('models/dog/source/animation-10-Rover.glb', 'models/fairy_forest.glb').then(([dog, forest]) => {
  dogLoadSuccess(dog)
  forestLoadSuccess(forest)
  run(0)
})
// 'models/scene2/rabbit_s_home.glb'
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

let sceneModel = null
function forestLoadSuccess(gltf) {
  sceneModel = gltf.scene
  sceneModel.position.set(-0.72,-0.83,0)
  // model.position.set(0,2.28,-1.3)
  // model.scale.set(0.3, 0.3, 0.3)
  // gui.add(model.position, 'x', -10, 10, 0.01)
  // gui.add(model.position, 'y', -10, 10, 0.01)
  // gui.add(model.position, 'z', -10, 10, 0.01)
  scene.add(sceneModel)

  sceneModel.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      if (child.name.includes('Tree')) {
        // child.material = new THREE.MeshPhysicalMaterial({
        //   color: "#ffffff",
        //   metalness: 1,
        //   roughness: 0.7
        // });
      }
      child.castShadow = true 
      // child.material = new THREE.MeshStandardMaterial({  wireframe: false })
      child.receiveShadow = true // 模型接收阴影
    }
  })
}

function treeHouseSuccess(gltf) {
  sceneModel = gltf.scene
  sceneModel.position.set(0,2.28,-1.3)
  sceneModel.scale.set(0.3, 0.3, 0.3)
  scene.add(sceneModel)
  sceneModel.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true 
      child.receiveShadow = true
    }
  })
}

function changeScene() {
  if (sceneModel) {
    scene.remove(sceneModel);
    // sceneModel.geometry.dispose();
    // sceneModel.material.dispose();
    modelsImport('models/scene2/rabbit_s_home.glb').then(([treeHouse]) => {
      treeHouseSuccess(treeHouse)
      hemisphereLight.position.set(0, 2, 10)
      gui.add(hemisphereLight.position, 'x', -10, 10, 0.01)
      gui.add(hemisphereLight.position, 'y', -10, 10, 0.01)
      gui.add(hemisphereLight.position, 'z', -10, 10, 0.01)
      
      hemisphereLight.intensity = 1.5
    })
  }
}

function hemisphereLightChange(val) {
  new TWEEN.Tween(hemisphereLight).to({
    intensity: val
  }, 2000).start()
}
let time = new Date()
const {x,y} = calcSunXYZ(115.7, 40, time)
let isDay = checkIsDay(x, y);

function checkIsDay(x, y) {
  if ((y <= 0 && x <= 0) || (y <= 0 && x >= 0)) {
    return true
  } else if ((y >= 0 && x <= 0) || (y >= 0 && x >= 0)) {
    return false
  }
}

function run () {
  stats.begin(); // ======= stats.begin =======

  // time = time.add(1, 'minute')
  // time = new Date()
  const {x,y,z} = calcSunXYZ(115.7, 40, time)
  if (y < 0 && x < 0 && isDay === true) {
    isDay = false
    hemisphereLightChange(0.0)
  } else if (y > 0 && x > 0 && isDay === false) {
    isDay = true
    hemisphereLightChange(0.6)
  }
  directionaLight.position.set(x,y,z)
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
    console.log(ponit3d.object.name);
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

const helper = new THREE.DirectionalLightHelper( directionaLight, 5 );
scene.add( helper );

// const spotLightHelper = new THREE.SpotLightHelper( spotLight );
// scene.add( spotLightHelper );
const sunObj = {
  time: 0
}
const folder = gui.addFolder('sun position');
const timeChange = folder.add(sunObj, 'time', 0, 24, 1)
timeChange.onChange(val => {
  time = new Date(dayjs(new Date).format('YYYY-MM-DD') + ' ' + val + ':00:00')
  const {x, y} = calcSunXYZ(115.7, 40, time)
  isDay = checkIsDay(x, y);
})

// helper end=========

</script>

<style scoped>
.street-lamp-switch {
  position: fixed;
  right: 0;
  top: 20%;
}
.home-btn {
  position: fixed;
  right: 0;
  top: 300px;
  z-index: 999;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
}
</style>