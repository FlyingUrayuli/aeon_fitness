<template>
  <!-- canvas 填滿容器，容器高度由父層 section 控制 -->
  <div ref="container" class="absolute inset-0 w-full h-full pointer-events-none"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 接收 props，控制 canvas 尺寸與 pin 的 DOM 元素
const props = defineProps({
  width: Number,
  height: Number,
  pinTriggerEl: Object
})

const container = ref(null)
let renderer, scene, camera, animationFrameId, model
let resizeObserver

// 初始化 Three.js 場景
function initThree() {
  if (!container.value) return

  // 取得容器實際尺寸
  const width = container.value.clientWidth
  const height = container.value.clientHeight

  // 建立場景與相機
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  // 相機初始位置（正視模型）
  camera.position.set(0, 0.5, 1.3)

  // 建立 renderer，背景透明
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)   // 完全透明背景
  container.value.appendChild(renderer.domElement)

  // 加入光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 10, 5)
  scene.add(directionalLight)
  scene.add(new THREE.AmbientLight(0x888888))

  // 載入 GLTF 模型
  const loader = new GLTFLoader()
  loader.load('/model/treadmill_00.glb', (gltf) => {
    model = gltf.scene
    model.scale.set(0.5, 0.5, 0.5)
    model.position.set(0, 0, 0)
    model.rotation.y = Math.PI / 2    // 預設轉正面
    scene.add(model)

    // 相機聚焦點
    const lookTarget = new THREE.Vector3(0, 0.3, -1.5)

    // 建立 GSAP ScrollTrigger 動畫（讓模型區塊滾動時固定在畫面中）
    gsap.timeline({
      scrollTrigger: {
        trigger: props.pinTriggerEl,
        start: 'top top',
        end: '+=2000',    // 可視範圍內滾動 2000px
        scrub: true,
        pin: true,
        pinSpacing: false
      }
    })
    // 啟動動畫循環
    animate(lookTarget)
  })
}

// 每幀渲染與自轉動畫
function animate(lookTarget) {
  animationFrameId = requestAnimationFrame(() => animate(lookTarget))
  if (model) {
    model.rotation.y += 0.01    // 模型持續自轉
  }
  // 每幀都更新，確保視角對準模型尾端（或你設定的 focus）
  camera.lookAt(lookTarget)
  renderer.render(scene, camera)
}

// 畫面 resize 時更新 renderer、相機與模型參數
function resize() {
  if (!renderer || !camera || !container.value) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight

  // 更新 renderer 尺寸
  renderer.setSize(width, height)
   // 更新相機參數
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  camera.position.set(0, 0.5, 1.3)

  // 重設模型參數
  if (model) {
    model.position.set(0, 0, 0)
    model.scale.set(0.5, 0.5, 0.5)
    model.rotation.y = Math.PI / 2
  }
}

// 初始化時載入場景與監聽 resize
onMounted(() => {
  initThree()

  // 使用 ResizeObserver 增加畫面靈敏度
  // ResizeObserver 監聽 container 實際尺寸變化，避免畫面調整時模型跑掉
  resizeObserver = new ResizeObserver(() => {
    resize()
  })
  if (container.value) resizeObserver.observe(container.value)

  // 補上 window resize（避免 ResizeObserver 無效）
  window.addEventListener('resize', resize)
  // 初始執行一次
  resize()
})

// 卸載時清理資源
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  resizeObserver?.disconnect()
  renderer?.dispose()
  cancelAnimationFrame(animationFrameId)
})
</script>
