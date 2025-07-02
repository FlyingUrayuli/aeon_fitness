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
let renderer, scene, camera, animationFrameId
let group // 👉 新增 Group 容器，把跑步機與人物一起包進去
let resizeObserver
const lookTarget = new THREE.Vector3(0, 0.3, -1.5) // 相機聚焦點
let runnerMixer // ⏯️ 控制人物動畫的 mixer

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

  // 👉 建立 Group，包住模型與人物
  group = new THREE.Group()
  scene.add(group)

  const loader = new GLTFLoader()


  // 載入跑步機模型
  loader.load('/model/treadmill_AZ50.glb', (gltf) => {
    const treadmillModel = gltf.scene
    treadmillModel.scale.set(0.5, 0.5, 0.5)
    treadmillModel.position.set(0, 0, 0)
    treadmillModel.rotation.y = Math.PI / 2    // 預設轉正面
    group.add(treadmillModel)


    // ⏬ 接著載入人物模型
    loader.load('/model/runner_02.glb', (runnerGltf) => {
      const runnerModel = runnerGltf.scene
      runnerModel.scale.set(0.5, 0.5, 0.5)

      runnerModel.rotation.y = Math.PI / 2

      // ✅ 自動對齊到底部並水平居中
      alignModel(runnerModel)

      runnerModel.position.x -= 0.5
      runnerModel.position.y += 0.14
      runnerModel.position.z -= 0.04

      group.add(runnerModel)

      // ⏯️ 初始化 mixer 並啟動第一段動畫
      runnerMixer = new THREE.AnimationMixer(runnerModel)

      const firstClip = runnerGltf.animations[0] // 假設有動畫，取第一個
      const action = runnerMixer.clipAction(firstClip)
      action.play()
      action.setEffectiveTimeScale(10)  // 播放速度變成 2 倍速

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

      // ✅ 兩個模型都載入完成，啟動動畫循環
      animate()
    })
  })
}

function alignModel(object) {
  const box = new THREE.Box3().setFromObject(object)
  const center = new THREE.Vector3()
  const size = new THREE.Vector3()
  box.getCenter(center)
  box.getSize(size)

  // 位移模型，使其底部貼齊 y=0，且在 x/z 軸居中
  object.position.x += (object.position.x - center.x)
  object.position.z += (object.position.z - center.z)
  object.position.y += -box.min.y
}

const clock = new THREE.Clock() // ⏱️ 必須用 clock 來更新時間差
// 每幀渲染與自轉動畫
function animate() {
  animationFrameId = requestAnimationFrame(animate)

  const delta = clock.getDelta() // 取得兩幀之間的時間差
  if (runnerMixer) runnerMixer.update(delta) // 🔁 播放動畫

  if (group) {
    // group.rotation.y += 0.1     👉 整個 group 自轉（包含跑步機與人物）
    group.rotation.y += 0.01   //  👉 整個 group 自轉（包含跑步機與人物）
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
