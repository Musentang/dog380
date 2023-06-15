<template>
</template>

<script setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'
import { GUI } from 'dat.gui'
import { createSphereSkybox, initRenderer, initCamera, initLight, initScene, randomArr } from '@/App.js'
import { modelsImport } from '@/lib/tool.js'
// const gui = new GUI()
const clock = new THREE.Clock()
let mixer = null
const target = new THREE.Vector3(0, 0.3, 0)

const scene = initScene()
const renderer = initRenderer()
const camera = initCamera(target)
const { directionaLight, ambientLight } = initLight(scene)

modelsImport('models/dog/source/animation-10-Rover.glb', 'models/fairy_forest.glb').then(([dog, forest]) => {
  dogLoadSuccess(dog)
  forestLoadSuccess(forest)
  run(0)
})

createSphereSkybox(scene)

const WAIT_ANIMATIONS = [0,1,3,9] // 待机 0,1,3,9
const INTERACT_ANIMATIONS = [2,5,7,8] // 交互 2,5,7,8
const MOVE_ANIMATIONS = [4,6] // 移动 4,6
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
  var actions = []
  animations.forEach(function (animation) {
    const action = mixer.clipAction(animation)
    action.clampWhenFinished = true
    action.loop = THREE.LoopOnce
    
    actions.push(action)
  })
  mixer.addEventListener('finished', () => {
    // mixer.addEventListener('finished', mixerFinished)
    const index = randomArr(WAIT_ANIMATIONS, Math.random())
    console.log(index)
    actions[index].reset().play()
  })
  actions[0].play()
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


function run () {
  mixer.update(clock.getDelta())
  controls.update()
  directionaLight.position.x -= 0.02
  if (directionaLight.position.x < -15) {
    directionaLight.position.x = 15
  }
  renderer.render(scene, camera) // 渲染
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
    console.log(ponit3d.object.name)
    if (ponit3d.object.name === 'Rover') {
      dog380Click()
    }
  }
})

function dog380Click() {

}

// helper =========
const controls = new OrbitControls( camera, renderer.domElement )
controls.target = target
var axesHelper = new THREE.AxesHelper(5) 
scene.add(axesHelper)
// helper end=========

</script>

<style scoped lang="scss">
</style>