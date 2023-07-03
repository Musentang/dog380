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
  const range = 50
  const count = 1000
  // 创建缓冲区存储雪花的粒子
  const position = []
  // 随机生成顶点的位置并给粒子缓冲区几何体传值
  for (let i = 0; i < count; i++) {
    const p = new THREE.Vector3(
      (Math.random() * range) - (range / 2),
      (Math.random() * range) - (range / 2),
      (Math.random() * range) - (range / 2)
    )
    p.velocityY = .1 + Math.random() / 5,
    p.velocityX = (Math.random() - .5) / 3,
    p.velocityZ = (Math.random() - .5) / 3,
    position.push(p)
  }
  particlesGeometry.setFromPoints(position)
  // 载入纹理
  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load(snowImg);
  //4、设置点的纹理材质（雪花贴图）
  const pointsMaterial = new THREE.PointsMaterial({
    'size': .3,
    'transparent': true,
    'opacity': .1,
    'map': texture,
    'sizeAttenuation': true,
    // 该融合模式表示，在画新像素时背景像素的颜色会被添加到新像素上。
    // 在本案例中，意味着黑色背景不会被加载出来，我们也可以把纹理背景定义为透明色，也会有类似效果。
    'blending': THREE.AdditiveBlending,
    'depthTest': false, // 解决贴图黑边的问题
    'depthWrite': false // 保证粒子之间不会互相影响
  })

  // 帧动画
  function renderScence() {
    position.map((res) => {
      // 计算位置
      res.y = res.y - (res.velocityY)
      res.x = res.x - (res.velocityX)
      res.z = res.z - (res.velocityZ)
      // 边界检查
      if(res.y <= -range / 2) res.y = range / 2
      if(res.x <= -range / 2 || res.x >= range / 2) res.x = res.x * -1
      if(res.z <= -range / 2 || res.z >= range / 2) res.velocityZ = res.velocityZ * -1
    })
    // 每次计算完位置从新渲染
    particlesGeometry.setFromPoints(position)
    const points = new THREE.Points(particlesGeometry, pointsMaterial)
    scene.add(points)
    renderer.render(scene, camera)
    requestAnimationFrame(renderScence)
  }
  renderScence()
}
