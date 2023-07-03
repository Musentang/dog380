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
import { snowScene } from './packages/snow.js'
import dayjs from 'dayjs'
import { LightProbeHelper } from 'three/addons/helpers/LightProbeHelper.js';
import * as spine from '@esotericsoftware/spine-threejs'
console.log(spine,88)
import { GUI } from 'dat.gui'
const gui = new GUI()

const clock = new THREE.Clock()
let mixer = null
const CAMERA_TARGET = new THREE.Vector3(0, 0.3, 0)

const scene = initScene()
const renderer = initRenderer()
const camera = initCamera(CAMERA_TARGET)
const { directionaLight, hemisphereLight, spotLight, ambientLight } = initLight(scene)
const switchOpen = ref(false)
// snowScene(scene, renderer, camera)
watch(() => switchOpen.value, val => spotLight.intensity = val ? 1.2 : 0.0)

const orbitControls = initOrbitControls(camera, renderer.domElement, CAMERA_TARGET)
modelsImport('models/dog/source/animation-10-Rover.glb', 'models/fairy_forest.glb').then(([dog, forest]) => {
  // dogLoadSuccess(dog)
  // forestLoadSuccess(forest)
  run(0)
})
// 'models/scene2/rabbit_s_home.glb'
// createSphereSkybox(scene)

const WAIT_ANIMATIONS = [0, 1, 3, 9] // 待机 0,1,3,9
const INTERACT_ANIMATIONS = [2, 5, 7, 8] // 交互 2,5,7,8
const MOVE_ANIMATIONS = [4, 6] // 移动 4,6
let dog380Status = 0 // 0 待机 1 交互 2 移动
let currAction = null
const actions = []
function dogLoadSuccess(gltf) {
  var model = gltf.scene
  model.scale.set(0.3, 0.3, 0.3)
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
  sceneModel.position.set(-0.72, -0.83, 0)
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
  sceneModel.position.set(0, 2.28, -1.3)
  sceneModel.scale.set(0.3, 0.3, 0.3)
  scene.add(sceneModel)
  sceneModel.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true 
      child.receiveShadow = true
    }
  })
}

let pointLight
function changeScene() {
  if (sceneModel) {
    scene.remove(sceneModel);
    modelsImport('models/scene2/rabbit_s_home.glb').then(([treeHouse]) => {
      treeHouseSuccess(treeHouse)
      ambientLight.intensity = 3
      pointLight = new THREE.PointLight( 0x404040, 4, 100 );
      pointLight.position.set( 0, 1, -0.5 );
      scene.add( pointLight );
      const sphereSize = 0.2;
      const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
      scene.add( pointLightHelper );
    })
  }
}

function hemisphereLightChange(val) {
  new TWEEN.Tween(hemisphereLight).to({
    intensity: val
  }, 2000).start()
}
let time = new Date()
const { x, y } = calcSunXYZ(115.7, 40, time)
let isDay = checkIsDay(x, y);

function checkIsDay(x, y) {
  if ((y <= 0 && x <= 0) || (y <= 0 && x >= 0)) {
    return true
  } else if ((y >= 0 && x <= 0) || (y >= 0 && x >= 0)) {
    return false
  }
}
let atlas, atlasLoader, geometry, material, mesh, skeletonMesh
let baseUrl = 'http://localhost:5173/models/spine/'
let skeletonFile = "raptor-pro.json";
let atlasFile = skeletonFile.replace("-pro", "").replace("-ess", "").replace(".json", ".atlas");
async function initSpine () {
  let assetManager;
  assetManager = new spine.AssetManager(baseUrl);
  assetManager.loadText(skeletonFile);
  assetManager.loadTextureAtlas(atlasFile);
  await assetManager.loadAll();


  geometry = new THREE.BoxGeometry(200, 200, 200);
  material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Load the texture atlas using name.atlas and name.png from the AssetManager.
  // The function passed to TextureAtlas is used to resolve relative paths.
  atlas = assetManager.require(atlasFile);

  // Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
  atlasLoader = new spine.AtlasAttachmentLoader(atlas);

  // Create a SkeletonJson instance for parsing the .json file.
  let skeletonJson = new spine.SkeletonJson(atlasLoader);

  // Set the scale to apply during parsing, parse the file, and create a new skeleton.
  skeletonJson.scale = 0.01;
  let skeletonData = skeletonJson.readSkeletonData(assetManager.require(skeletonFile));

  // Create a SkeletonMesh from the data and attach it to the scene
  skeletonMesh = new spine.SkeletonMesh(skeletonData, (parameters) => {
    parameters.depthTest = true;
    parameters.depthWrite = true;
    parameters.alphaTest = 0.001;
  });
  skeletonMesh.state.setAnimation(0, 'walk', true);
  console.log(skeletonMesh.state)
  skeletonMesh.position.set(-6, -4, 0)
  mesh.add(skeletonMesh);
}

initSpine()

function run() {
  stats.begin(); // ======= stats.begin =======

  // time = time.add(1, 'minute')
  // time = new Date()
  const { x, y, z } = calcSunXYZ(115.7, 40, time)
  if (y < 0 && x < 0 && isDay === true) {
    isDay = false
    hemisphereLightChange(0.0)
  } else if (y > 0 && x > 0 && isDay === false) {
    isDay = true
    hemisphereLightChange(0.6)
  }
  directionaLight.position.set(x, y, z)
  TWEEN.update()
  // mixer.update(clock.getDelta())
  skeletonMesh.update(clock.getDelta());
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

const helper = new THREE.DirectionalLightHelper(directionaLight, 5);
scene.add(helper);

// const spotLightHelper = new THREE.SpotLightHelper( spotLight );
// scene.add( spotLightHelper );
const sunObj = {
  time: 0
}
const folder = gui.addFolder('sun position');
const timeChange = folder.add(sunObj, 'time', 0, 24, 1)
timeChange.onChange(val => {
  time = new Date(dayjs(new Date).format('YYYY-MM-DD') + ' ' + val + ':00:00')
  const { x, y } = calcSunXYZ(115.7, 40, time)
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