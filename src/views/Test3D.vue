<template>
  <div class="test-3d-container">
    <h1 class="title">3D 動畫展示</h1>
    <p class="subtitle">滾動頁面來控制動畫播放，在頂端時動畫會循環播放</p>
    
    <div class="model-display">
      <div ref="threeContainer" class="animation-display"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import modelUrl from '@/assets/video_AZ50_ver7.glb?url'

const selectedModel = ref(modelUrl)

// Three.js 相關變數
const threeContainer = ref(null)
const scene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const model = shallowRef(null)
const mixer = shallowRef(null)
const animations = shallowRef([])
const clock = shallowRef(null)

// 滾動控制相關變數
const scrollProgress = ref(0)
const isAtTop = ref(true)

// 拖拽控制相關變數
const isMouseDown = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)
const rotationY = ref(0)
const rotationX = ref(0)

const initThree = () => {
  scene.value = new THREE.Scene()
  scene.value.background = new THREE.Color(0x1f2937)
  clock.value = new THREE.Clock()

  camera.value = new THREE.PerspectiveCamera(
    75,
    threeContainer.value.clientWidth / threeContainer.value.clientHeight,
    0.1,
    1000
  )
  camera.value.position.set(0, 1, 3)
  camera.value.lookAt(0, 0, 0)

  renderer.value = new THREE.WebGLRenderer({ antialias: true })
  renderer.value.setSize(
    threeContainer.value.clientWidth,
    threeContainer.value.clientHeight
  )
  renderer.value.shadowMap.enabled = true
  renderer.value.shadowMap.type = THREE.PCFSoftShadowMap
  threeContainer.value.appendChild(renderer.value.domElement)

  // 設置燈光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.value.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  directionalLight.castShadow = true
  scene.value.add(directionalLight)

  const pointLight = new THREE.PointLight(0xffffff, 0.5)
  pointLight.position.set(-5, 5, 0)
  scene.value.add(pointLight)

  animate()
}

const loadModel = () => {
  const loader = new GLTFLoader()
  loader.load(
    selectedModel.value,
    (gltf) => {
        console.log('Model loaded:', gltf)
      model.value = gltf.scene
      model.value.scale.set(1, 1, 1)
      model.value.position.set(0, -1, 0)

      model.value.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      scene.value.add(model.value)

      // 設置動畫
      if (gltf.animations && gltf.animations.length > 0) {
        mixer.value = new THREE.AnimationMixer(model.value)
        animations.value = gltf.animations
        
        console.log('Available animations:', gltf.animations.map(anim => anim.name))
        
        // 尋找要播放的動畫
        const armatureAnimation = gltf.animations.find(anim => 
          anim.name && anim.name.toLowerCase().includes('armature')
        )
        const beltAnimation = gltf.animations.find(anim => 
          anim.name === 'belt_test.001'
        )
        
        const playingAnimations = []
        
        // 播放 Armature 動畫
        if (armatureAnimation) {
          console.log('Playing Armature animation:', armatureAnimation.name)
          const armatureAction = mixer.value.clipAction(armatureAnimation)
          armatureAction.setLoop(THREE.LoopRepeat)
          armatureAction.play()
          playingAnimations.push(armatureAnimation)
        } else {
          console.log('Armature animation not found')
        }
        
        // 播放 belt_test.001 動畫
        if (beltAnimation) {
          console.log('Playing belt_test.001 animation:', beltAnimation.name)
          const beltAction = mixer.value.clipAction(beltAnimation)
          beltAction.setLoop(THREE.LoopRepeat)
          beltAction.play()
          playingAnimations.push(beltAnimation)
        } else {
          console.log('belt_test.001 animation not found')
        }
        
        // 更新 animations 陣列為正在播放的動畫
        if (playingAnimations.length > 0) {
          animations.value = playingAnimations
          console.log(`Playing ${playingAnimations.length} animations simultaneously`)
        } else {
          console.log('No target animations found, playing first animation')
          // 如果都沒找到，播放第一個動畫
          const action = mixer.value.clipAction(animations.value[0])
          action.setLoop(THREE.LoopRepeat)
          action.play()
        }
      }
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error)
    }
  )
}

// 拖拽功能
const onMouseDown = (event) => {
  isMouseDown.value = true
  mouseX.value = event.clientX
  mouseY.value = event.clientY
  threeContainer.value.style.cursor = 'grabbing'
}

const onMouseMove = (event) => {
  if (!isMouseDown.value || !model.value) return

  const deltaX = event.clientX - mouseX.value
  const deltaY = event.clientY - mouseY.value
  
  rotationY.value += deltaX * 0.01
  rotationX.value += deltaY * 0.01
  
  // 限制 X 軸旋轉範圍，避免翻轉
  rotationX.value = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationX.value))
  
  model.value.rotation.y = rotationY.value
  model.value.rotation.x = rotationX.value
  
  mouseX.value = event.clientX
  mouseY.value = event.clientY
}

const onMouseUp = () => {
  isMouseDown.value = false
  threeContainer.value.style.cursor = 'grab'
}

const animate = () => {
  requestAnimationFrame(animate)
  
  if (mixer.value && clock.value) {
    const delta = clock.value.getDelta()
    
    if (isAtTop.value) {
      // 在頂端時正常播放動畫（循環播放）
      mixer.value.update(delta)
    } else {
      // 根據滾動進度控制動畫
      if (animations.value.length > 0) {
        // 同時控制所有播放中的動畫
        animations.value.forEach(animation => {
          const animationDuration = animation.duration
          const targetTime = scrollProgress.value * animationDuration
          
          // 為每個動畫設置時間
          const action = mixer.value.existingAction(animation)
          if (action) {
            action.time = targetTime
          }
        })
        
        // 手動更新混合器但不增加時間
        mixer.value.update(0)
      }
    }
  }
  
  if (renderer.value && scene.value && camera.value) {
    renderer.value.render(scene.value, camera.value)
  }
}

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  // 計算滾動進度 (0-1)
  const maxScroll = documentHeight - windowHeight
  const progress = Math.min(scrollTop / maxScroll, 1)
  scrollProgress.value = progress
  
  // 檢查是否在頂端 (容許一些誤差)
  isAtTop.value = scrollTop < 50
}

const onWindowResize = () => {
  if (!camera.value || !renderer.value || !threeContainer.value) return

  camera.value.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
  camera.value.updateProjectionMatrix()
  renderer.value.setSize(
    threeContainer.value.clientWidth,
    threeContainer.value.clientHeight
  )
}

onMounted(() => {
  initThree()
  loadModel()
  
  // 添加拖拽事件監聽器
  const container = threeContainer.value
  container.addEventListener('mousedown', onMouseDown)
  container.addEventListener('mousemove', onMouseMove)
  container.addEventListener('mouseup', onMouseUp)
  container.addEventListener('mouseleave', onMouseUp)
  container.style.cursor = 'grab'
  
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', onWindowResize)
  
  // 初始化滾動狀態
  handleScroll()
})

onBeforeUnmount(() => {
  // 移除拖拽事件監聽器
  const container = threeContainer.value
  if (container) {
    container.removeEventListener('mousedown', onMouseDown)
    container.removeEventListener('mousemove', onMouseMove)
    container.removeEventListener('mouseup', onMouseUp)
    container.removeEventListener('mouseleave', onMouseUp)
  }
  
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', onWindowResize)
  
  if (renderer.value) {
    renderer.value.dispose()
  }
})
</script>

<style scoped>
.test-3d-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 300vh; /* 確保有足夠的滾動空間 */
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
  color: #1f2937;
}

.subtitle {
  text-align: center;
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.model-display {
  width: 100%;
  height: 600px;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 4rem;
  position: sticky;
  top: 2rem;
}

.animation-display {
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  overflow: hidden;
  cursor: grab;
  user-select: none;
}

.animation-display:active {
  cursor: grabbing;
}

.scroll-content {
  padding-top: 2rem;
}

.content-section {
  background: white;
  padding: 3rem;
  margin-bottom: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.content-section h2 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.content-section p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 1rem;
}

.content-section ul {
  list-style: none;
  padding: 0;
}

.content-section li {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.spacer {
  height: 200vh;
}

@media (max-width: 768px) {
  .test-3d-container {
    padding: 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .model-display {
    height: 400px;
    position: relative;
    top: auto;
  }
  
  .content-section {
    padding: 2rem;
  }
  
  .content-section h2 {
    font-size: 1.5rem;
  }
  
  .content-section p,
  .content-section li {
    font-size: 1rem;
  }
}
</style>