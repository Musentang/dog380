import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import SunCalc from 'suncalc'

export function createSphereSkybox(scene) {
  const textloader = new THREE.TextureLoader().load('/skyboximg/carton_bg.jpeg')
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
  const directionaLight = new THREE.DirectionalLight(0xffffff, 1.0)
  directionaLight.position.set(-1.89, 23.97, 6.82)
  directionaLight.castShadow = true
  directionaLight.shadow.mapSize.width = 2048
  directionaLight.shadow.mapSize.height = 2048
  directionaLight.shadow.camera.near = 0.1
  directionaLight.shadow.camera.far = 50
  directionaLight.shadow.radius = 10
  directionaLight.shadow.bias = -0.001
  scene.add( directionaLight )

  const hemisphereLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.6 )
  hemisphereLight.position.set(0, 10, 10)
  scene.add( hemisphereLight )

  const ambientLight = new THREE.AmbientLight( 0x404040, 0.0 ); // 柔和的白光
  scene.add( ambientLight );  

  const spotLight = new THREE.SpotLight( 0xfff5c9, 0.0 );
  spotLight.position.set( 0, 3, 0 );
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 0.1;
  spotLight.shadow.camera.far = 100;
  spotLight.shadow.camera.fov = 5;
  spotLight.shadow.bias = -0.001;
  spotLight.angle = Math.PI/13
  scene.add( spotLight );

  return { directionaLight, hemisphereLight, spotLight }
}

export function initOrbitControls(camera, domElement, target) {
  const controls = new OrbitControls( camera, domElement )
  controls.target = target
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxDistance  = 100
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

export function calcSunXYZ(longitude = 115.7, latitude = 39.4, obsTime) {
  // 设置观测的时间
  // const obsTime = new Date('2023-06-20 10:00:00'); // 格式：'yyyy-mm-ddThh:mm:ss'


  // get today's sunlight times for London
  // var times = SunCalc.getTimes(obsTime, latitude, longitude);

  // format sunrise time from the Date object
  // var sunriseStr = times.sunrise.getHours() + ':' + times.sunrise.getMinutes();

  // get position of the sun (azimuth and altitude) at today's sunrise
  // console.log(times)
  // var sunrisePos = SunCalc.getPosition(times.sunrise, latitude, longitude);
  const sunPosition = SunCalc.getPosition(obsTime, latitude, longitude);

  // get sunrise azimuth in degrees
  // var sunriseAzimuth = sunrisePos.azimuth * 180 / Math.PI;

  const distance = 25;

  // 计算太阳在三维坐标系中的坐标
  const x = -distance * Math.cos(sunPosition.altitude) * Math.sin(sunPosition.azimuth);
  const y = distance * Math.sin(sunPosition.altitude);
  const z = distance * Math.cos(sunPosition.altitude) * Math.cos(sunPosition.azimuth);

  // console.log("太阳坐标 (x, y, z):", x, y, z);
  return {x,y,z}
}