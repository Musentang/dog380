/***
 * @author: lxy
 * @description: 实现下雪场景
 * Date: 2023-06-28
 */
import * as THREE from 'three'

export function snowScene() {
  // 创建例子缓冲区
  const particlesGeometry = new THREE.BufferGeometry()
  const scene = new THREE.Scene()
  const count = 10000
  // 创建缓冲区存储雪花的粒子
  const position = new Float32Array(count * 3)
  // 随机生成顶点的位置并给粒子缓冲区几何体传值 Math.random()生成0到小于1的值，生成-100到100的点
  for(let i = 0; i < count * 3; i++) {
    position[i] = Math.random() * 100 - 100
  }
  particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  )
  //4、设置点的纹理材质（雪花贴图）
  const pointsMaterial = new THREE.PointsMaterial()
  pointsMaterial.size = 0.5
  // 载入纹理
  const textureLoader = new THREE.TextureLoader('../img/snow.png')
  // 设置点材质纹理
  pointsMaterial.map = texture
  pointsMaterial.alphaMap = texture

  // 加入场景搞定
  scene.add(points)
}