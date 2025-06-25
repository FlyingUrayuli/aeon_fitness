<template>
  <div ref="container" class="absolute inset-0 w-full h-full pointer-events-none"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  width: Number,
  height: Number,
  pinTriggerEl: Object
})

const container = ref(null)

let renderer, scene, camera, animationFrameId

function initThree() {
  if (!container.value) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(3, 0.5, 2)

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0) // 透明背景
  container.value.appendChild(renderer.domElement)

  // 光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 10, 5)
  scene.add(directionalLight)
  scene.add(new THREE.AmbientLight(0x888888))

  const loader = new GLTFLoader()
  loader.load('/model/treadmill_00.glb', (gltf) => {
    const model = gltf.scene
    model.scale.set(0.5, 0.5, 0.5)
    model.position.set(0, 0.3, 0) // 模型偏上居中

    scene.add(model)

    const lookTarget = new THREE.Vector3(0, 1, 0)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: props.pinTriggerEl,
        start: 'top top',
        end: '+=1500',
        scrub: true,
        pin: true,
        pinSpacing: true,
      }
    })

    tl.to(camera.position, { x: 0, z: 2, duration: 1 })
    tl.to(model.rotation, { y: Math.PI / 2, duration: 1 }, '<')
    tl.to(lookTarget, { x: 0, y: 0.3, z: -1.5, duration: 1 })
    tl.to(camera.position, { z: 1.2, duration: 1 }, '<')

    function animate() {
      animationFrameId = requestAnimationFrame(animate)
      camera.lookAt(lookTarget)
      renderer.render(scene, camera)
    }
    animate()
  })
}

function resize() {
  if (!renderer || !camera || !container.value) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

watch(() => [props.width, props.height], resize)

onMounted(() => {
  initThree()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  renderer?.dispose()
  cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
div[ref="container"] {
  pointer-events: none;
}
</style>
