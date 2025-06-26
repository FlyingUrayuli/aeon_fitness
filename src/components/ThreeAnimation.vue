<template>
  <!-- canvas 填滿容器，容器高度由父層 section 控制 -->
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
let renderer, scene, camera, animationFrameId, model

function initThree() {
  if (!container.value) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(0, 0.5, 1.3)

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)
  container.value.appendChild(renderer.domElement)

  // 光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 10, 5)
  scene.add(directionalLight)
  scene.add(new THREE.AmbientLight(0x888888))

  // 載入模型
  const loader = new GLTFLoader()
  loader.load('/model/treadmill_00.glb', (gltf) => {
    model = gltf.scene
    model.scale.set(0.5, 0.5, 0.5)
    model.position.set(0, 0, 0)
    model.rotation.y = Math.PI / 2
    scene.add(model)

    const lookTarget = new THREE.Vector3(0, 0.3, -1.5)

    // 動畫（固定區塊內進行）
    gsap.timeline({
      scrollTrigger: {
        trigger: props.pinTriggerEl,
        start: 'top top',
        end: '+=2000', // 僅區塊內滾動
        scrub: true,
        pin: true,
        pinSpacing: false
      }
    })

    animate(lookTarget)
  })
}

function animate(lookTarget) {
  animationFrameId = requestAnimationFrame(() => animate(lookTarget))

  if (model) {
    model.rotation.y += 0.01 // 自轉
  }

  camera.lookAt(lookTarget)
  renderer.render(scene, camera)
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

