import * as THREE from 'three'

export function createSphereSkybox(scene) {
  const textloader = new THREE.TextureLoader().load('models/bg.jpeg')
  const geometry = new THREE.SphereGeometry(500, 32, 32)
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