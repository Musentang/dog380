import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function createSphereSkybox(scene) {
  const textloader = new THREE.TextureLoader().load('models/bg.jpeg')
  const geometry = new THREE.SphereGeometry(50, 32, 32)
  const material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    map: textloader
  })

  const sphere = new THREE.Mesh(geometry, material)

  sphere.position.copy({
    x: 0,
    y: 0,
    z: 0
  })

  scene.add(sphere)
}

export function initScene() {
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog( 0xcccccc, 10, 100 );
  return scene
}

export function initRenderer() {
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  const renderer = new THREE.WebGLRenderer({ canvas })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer
}

export function initCamera(target) {
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000) // 创建透视相机
  camera.position.set(0,2,2)
  camera.lookAt(target)
  return camera
}

export function initLight(scene) {
  const directionaLight = new THREE.DirectionalLight(0xffffff, 0.0);
  directionaLight.position.set(30, 10, 10);
  directionaLight.castShadow = true;
  directionaLight.shadow.mapSize.width = 2048;
  directionaLight.shadow.mapSize.height = 2048;
  directionaLight.shadow.camera.near = 0.1;
  directionaLight.shadow.camera.far = 50;
  directionaLight.shadow.radius = 10
  directionaLight.shadow.bias = -0.001;
  scene.add( directionaLight );

  const hemisphereLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.0 );
  scene.add( hemisphereLight );
  hemisphereLight.position.set(0, 10, 10)

  // const ambientLight = new THREE.AmbientLight( 0x404040, 1 ); // 柔和的白光
  // scene.add( ambientLight );  

  return { directionaLight, hemisphereLight }
}

export function initOrbitControls(camera, domElement, target) {
  const controls = new OrbitControls( camera, domElement )
  controls.target = target
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxDistance  = 3
  controls.minDistance  = 0.5
  controls.maxPolarAngle  = 1.6
  controls.minPolarAngle  = 0.8
  return controls
}

function getRandomMap(arr) {
  const len = arr.length
  const range = 1 / len
  const rangeArr = []
  for(let i = 0; i < len; i++) {
    const min = range * i;
    const max = range * (i + 1);
    rangeArr.push({min, max, value: arr[i]})
  }
  return rangeArr
}

function getRangeMapValue(rangeArr, value) {
  for (let i = 0, len = rangeArr.length; i < len; i++) {
    const item = rangeArr[i]
    if (value >= item.min && value <= item.max) {
      return item.value
    }
  }
  return getRangeMapValue(rangeArr, Math.random())
}

export function randomArr(arr, randomValue) {
  const rangeArr = getRandomMap(arr)
  const index = getRangeMapValue(rangeArr, randomValue)
  return index
}