import * as THREE from 'three'

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
  const directionaLight = new THREE.DirectionalLight(0xffffff, 1);
  directionaLight.position.set(15, 10, 5);
  directionaLight.castShadow = true;
  directionaLight.shadow.mapSize.width = 1024;
  directionaLight.shadow.mapSize.height = 1024;
  directionaLight.shadow.camera.near = 0.1;
  directionaLight.shadow.camera.far = 50;
  directionaLight.shadow.radius = 10
  directionaLight.shadow.bias = -0.001;
  scene.add( directionaLight );

  const ambientLight = new THREE.AmbientLight( 0x404040, 2 ); // 柔和的白光
  scene.add( ambientLight );  

  return { directionaLight, ambientLight }
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