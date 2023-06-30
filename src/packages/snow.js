/***
 * @author: lxy
 * @description: 实现下雪场景
 * Date: 2023-06-28
 */
import * as THREE from 'three'
import snowImg from "@/img/snow.png"

export function snowScene(scene, renderer, camera) {
  // 创建例子缓冲区
  const particlesGeometry = new THREE.BufferGeometry()

  const range = 30
  const count = 2000
  // 创建缓冲区存储雪花的粒子
  const position = []
  // 随机生成顶点的位置并给粒子缓冲区几何体传值 Math.random()生成0到小于1的值，生成-100到100的点
  for (let i = 0; i < count; i++) {
    const p = new THREE.Vector3(
      (Math.random() * range) - (range / 2),
      Math.random() * range,
      (Math.random() * range) - (range / 2)
    )
    position.push(...p.toArray())
  }
  particlesGeometry.setFromPoints(position)
  // 载入纹理
  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load(snowImg);
  //4、设置点的纹理材质（雪花贴图）
  const pointsMaterial = new THREE.PointsMaterial(
    {
      'size': 0.5,
      'transparent': true,
      'opacity': 0.5,
      'map': texture,
      'sizeAttenuation': true,
      // 该融合模式表示，在画新像素时背景像素的颜色会被添加到新像素上。
      // 在本案例中，意味着黑色背景不会被加载出来，我们也可以把纹理背景定义为透明色，也会有类似效果。
      'blending': THREE.AdditiveBlending,
      'depthTest': false, // 解决贴图黑边的问题
      'depthWrite': false // 保证粒子之间不会互相影响
    }
  )
  // 初始化渲染粒子
  function initRain(vetics) {
    const vertices = new THREE.Float32BufferAttribute(vetics, 3)
    particlesGeometry.attributes.position = vertices
    const cloud = new THREE.Points(particlesGeometry, pointsMaterial)
    scene.add(cloud)
    return cloud
  }
  // 帧动画
  const speed = 1
  let cloud = null
  // 初始化雪花
  cloud = initRain(position)
  // 动画
  function renderScence() {
    requestAnimationFrame(renderScence)
    if (cloud) {
      scene.remove(cloud)
    }
    let rainPositionArray = Array.from(cloud.geometry.attributes.position.array)
    for (let i = 0; i < rainPositionArray.length; i += 2) {
      rainPositionArray[i + 1] -= speed
      if (rainPositionArray[i + 1] < 0) {
        rainPositionArray[i + 1] = Math.random() * range - range / 2
      }
    }
    cloud = initRain(rainPositionArray)
    renderer.render(scene, camera)
  }
  renderScence()
}
