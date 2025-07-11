<template>
  <div class="w-full h-96 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
    <div ref="threeContainer" class="w-full h-full cursor-grab active:cursor-grabbing"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// 定義 props：接收模型路徑
const props = defineProps({
  modelPath: {
    type: String,
    required: true
  }
})

// 初始化 refs（Vue 3 Composition API）
const threeContainer = ref(null)        // DOM 容器
const scene = shallowRef(null)          // 三維場景
const camera = shallowRef(null)         // 攝影機
const renderer = shallowRef(null)       // 渲染器
const model = shallowRef(null)          // 模型

const isMouseDown = ref(false)          // 滑鼠按下狀態
const mouseX = ref(0)                   // 滑鼠 X 座標
const rotationY = ref(0)                // 模型 Y 軸旋轉角度

// 初始化 Three.js 場景
const initThree = () => {
  // 建立場景，設定背景色
  scene.value = new THREE.Scene()
  scene.value.background = new THREE.Color(0xe0f7ff) // 淺藍色背景

  // 建立攝影機（PerspectiveCamera）
  camera.value = new THREE.PerspectiveCamera(
    75,
    threeContainer.value.clientWidth / threeContainer.value.clientHeight,
    0.1,
    1000
  )
  camera.value.position.set(-3.35675, 1.11077 , 0) // 攝影機位置更靠近模型
  camera.value.lookAt(0, 0, 0)                     // 注視模型原點

  // 建立渲染器並附加到 DOM
  renderer.value = new THREE.WebGLRenderer({ antialias: true })
  renderer.value.setSize(
    threeContainer.value.clientWidth,
    threeContainer.value.clientHeight
  )
  renderer.value.shadowMap.enabled = true
  renderer.value.shadowMap.type = THREE.PCFSoftShadowMap
  threeContainer.value.appendChild(renderer.value.domElement)

  // 添加暖白色環境光（#fff7e6）
  const ambientLight = new THREE.AmbientLight(0xfff7e6, 2.0)
  scene.value.add(ambientLight)

  // 添加主方向光（暖白光）
  const directionalLight = new THREE.DirectionalLight(0xfff7e6, 2.0)
  directionalLight.position.set(7, 7, 7)
  directionalLight.castShadow = true
  scene.value.add(directionalLight)

  // 添加次方向光（反方向補光）
  const directionalLight2 = new THREE.DirectionalLight(0xfff7e6, 2.0)
  directionalLight2.position.set(-7, 7, 7)
  directionalLight2.castShadow = true
  scene.value.add(directionalLight2)

  // 啟動動畫渲染循環
  animate()
}

// 載入 GLTF 模型
const loadModel = () => {
  const loader = new GLTFLoader()
  loader.load(
    props.modelPath,
    (gltf) => {
      model.value = gltf.scene
      model.value.scale.set(1.7, 1.7, 1.7)
      model.value.position.set(0, -1, 0)

      // 為所有網格啟用陰影
      model.value.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      scene.value.add(model.value)
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error)
    }
  )
}

// 渲染動畫循環
const animate = () => {
  requestAnimationFrame(animate)
  if (renderer.value && scene.value && camera.value) {
    renderer.value.render(scene.value, camera.value)
  }
}

// 滑鼠拖曳控制模型旋轉
const onMouseDown = (event) => {
  isMouseDown.value = true
  mouseX.value = event.clientX
  threeContainer.value.style.cursor = 'grabbing'
}

const onMouseMove = (event) => {
  if (!isMouseDown.value || !model.value) return

  const deltaX = event.clientX - mouseX.value
  rotationY.value += deltaX * 0.01
  model.value.rotation.y = rotationY.value
  mouseX.value = event.clientX
}

const onMouseUp = () => {
  isMouseDown.value = false
  threeContainer.value.style.cursor = 'grab'
}

// 窗口縮放時更新攝影機與渲染器
const onWindowResize = () => {
  if (!camera.value || !renderer.value) return
  camera.value.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
  camera.value.updateProjectionMatrix()
  renderer.value.setSize(
    threeContainer.value.clientWidth,
    threeContainer.value.clientHeight
  )
}


// 加入滑鼠與 resize 事件
const addEventListeners = () => {
  const container = threeContainer.value
  container.addEventListener('mousedown', onMouseDown)
  container.addEventListener('mousemove', onMouseMove)
  container.addEventListener('mouseup', onMouseUp)
  container.addEventListener('mouseleave', onMouseUp)
  window.addEventListener('resize', onWindowResize)
}


// 移除事件監聽器
const removeEventListeners = () => {
  const container = threeContainer.value
  if (container) {
    container.removeEventListener('mousedown', onMouseDown)
    container.removeEventListener('mousemove', onMouseMove)
    container.removeEventListener('mouseup', onMouseUp)
    container.removeEventListener('mouseleave', onMouseUp)
  }
  window.removeEventListener('resize', onWindowResize)
}

// 初始化時呼叫初始化函式
onMounted(() => {
  initThree()
  loadModel()
  addEventListeners()
})

// 離開元件時清除資源
onBeforeUnmount(() => {
  removeEventListeners()
  if (renderer.value) {
    renderer.value.dispose()
  }
})
</script>
