<template>
  <div ref="canvasContainer" class="absolute inset-0"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const canvasContainer = ref(null)

onMounted(() => {
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(width, height)
  canvasContainer.value.appendChild(renderer.domElement)

  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(5, 10, 5)
  scene.add(light)

  const ambient = new THREE.AmbientLight(0x888888)
  scene.add(ambient)

  const loader = new GLTFLoader()
  loader.load('/model/treadmill_00.glb', (gltf) => {
    const model = gltf.scene
    model.scale.set(1, 1, 1)
    scene.add(model)

    // 初始視角：側面
    camera.position.set(2, 1, 0)
    const lookTarget = new THREE.Vector3(0, 1, 0)
    camera.lookAt(lookTarget)

    // 跑步機尾端位置（你應該提供真實值）
    const treadmillTail = new THREE.Vector3(0, 1, -1.5)

    // 相機位移（旋轉 90 度）
    gsap.to(camera.position, {
      scrollTrigger: {
        trigger: canvasContainer.value,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
      x: 0,
      z: 2,
      duration: 1
    })

    // 聚焦轉向尾端
    gsap.to(lookTarget, {
      scrollTrigger: {
        trigger: canvasContainer.value,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
      x: treadmillTail.x,
      y: treadmillTail.y,
      z: treadmillTail.z,
      onUpdate: () => camera.lookAt(lookTarget)
    })

    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()
  })
})
</script>
