import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const GLTF_LOADER = new GLTFLoader();

const extMap = {
  glb: GLTF_LOADER
}

export function modelsImport(...url) {
  const proArr = url.map(u => modelsLoad(u))
  return Promise.all(proArr)
}

export function modelsLoad(url) {
  return new Promise((resolve, reject) => {
    if (!url) return reject() 
    const loader = extMap[url.split('.')[1]]
    loader.load(url, g => {
      resolve(g)
    })
  })
}
