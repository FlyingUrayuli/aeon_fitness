<!-- src/components/HeroAnimation.vue -->
<template>
  <div ref="heroAnimationContainer" class="fixed inset-0 w-screen h-screen overflow-hidden">

    <div class="absolute inset-0 bg-transparent z-0">
      <div ref="threeContainer" class="w-full h-full"></div>
    </div>

    <div ref="scrollContainer" class="absolute inset-0 overflow-y-scroll z-10 pointer-events-auto">
      <!-- 確保 features 已經正確導入並可用 -->
      <div :style="{ height: `${(1 + features.length) * 100}vh` }">
        <div class="h-screen w-full bg-transparent"></div>

        <!-- FeatureSection 確保已正確導入 -->
        <FeatureSection
          v-for="(feature, index) in features"
          :key="index"
          :id="'feature-section-' + index"
          :title="feature.title"
          :description="feature.description"
          class="min-h-screen flex items-center justify-center bg-transparent"
          :class="{
            'opacity-100': currentSection === (index),
            'opacity-0': currentSection !== (index)
          }"
          :style="{ transition: 'opacity 0.7s ease-out' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import modelUrl from '@/assets/video_AZ50_ver10.glb?url'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

// 確保 FeatureSection 從正確的路徑導入
import FeatureSection from './FeatureSection.vue'

// 從新創建的檔案導入 features 陣列
import { features } from '../data/product'; // <--- 這裡的路徑已更新

gsap.registerPlugin(ScrollTrigger);

const selectedModel = ref(modelUrl)

// Three.js 相關的響應式變數
const threeContainer = ref(null)
const scene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const model = shallowRef(null)
const mixer = shallowRef(null)
const animations = shallowRef([])
const clock = shallowRef(null)

// 滾動相關的響應式變數
const scrollProgress = ref(0)
const isAtTop = ref(true)

const scrollContainer = ref(null)
const heroAnimationContainer = ref(null)

// currentSection 保持不變
const currentSection = ref(0)

// --- Three.js 初始化 --- (保持不變)
const initThree = () => {
  scene.value = new THREE.Scene()
  scene.value.background = new THREE.Color(0xffffff)
  clock.value = new THREE.Clock()

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.value = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.value.position.set(0, 1, 2.25);
  camera.value.lookAt(0, 0.5, 0);

  renderer.value = new THREE.WebGLRenderer({ antialias: true })
  renderer.value.setSize(width, height)
  renderer.value.setPixelRatio(window.devicePixelRatio)
  renderer.value.shadowMap.enabled = true
  renderer.value.shadowMap.type = THREE.PCFSoftShadowMap
  threeContainer.value.appendChild(renderer.value.domElement)

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
  scene.value.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
  directionalLight.position.set(0, 10, 0)
  directionalLight.target.position.set(0, 0, 0);
  scene.value.add(directionalLight.target);
  directionalLight.castShadow = true

  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -5;
  directionalLight.shadow.camera.right = 5;
  directionalLight.shadow.camera.top = 5;
  directionalLight.shadow.camera.bottom = -5;
  directionalLight.shadow.bias = -0.0001;

  scene.value.add(directionalLight)

  animate()
}

// --- 模型載入 --- (保持不變)
const loadModel = () => {
  const loader = new GLTFLoader()
  loader.load(
    selectedModel.value,
    (gltf) => {
      console.log('Model loaded:', gltf)
      model.value = gltf.scene
      model.value.scale.set(1, 1, 1)
      model.value.position.set(0, 0, 0)
      model.value.rotation.y = Math.PI / 4.5;

      model.value.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      scene.value.add(model.value)

      if (gltf.animations && gltf.animations.length > 0) {
        mixer.value = new THREE.AnimationMixer(model.value)
        animations.value = gltf.animations

        console.log('Available animations:', gltf.animations.map(anim => anim.name))

        const playingAnimations = []

        const armatureAnimation = gltf.animations.find(anim =>
          anim.name && anim.name.toLowerCase().includes('armature')
        )
        if (armatureAnimation) {
          console.log('Playing Armature animation:', armatureAnimation.name)
          const armatureAction = mixer.value.clipAction(armatureAnimation)
          armatureAction.setLoop(THREE.LoopRepeat)
          armatureAction.play()
          playingAnimations.push(armatureAnimation)
        } else {
          console.log('Armature animation not found')
        }

        const beltAnimation = gltf.animations.find(anim =>
          anim.name === 'belt_test.001'
        )
        if (beltAnimation) {
          console.log('Playing belt_test.001 animation:', beltAnimation.name)
          const beltAction = mixer.value.clipAction(beltAnimation)
          beltAction.setLoop(THREE.LoopRepeat)
          beltAction.play()
          playingAnimations.push(beltAnimation)
        } else {
          console.log('belt_test.001 animation not found')
        }

        if (playingAnimations.length > 0) {
          animations.value = playingAnimations
          console.log(`Playing ${playingAnimations.length} animations simultaneously`)
        } else {
          console.log('No target animations found, playing first available animation')
          const action = mixer.value.clipAction(gltf.animations[0])
          action.setLoop(THREE.LoopRepeat)
          action.play()
          animations.value = [gltf.animations[0]]
        }
      } else {
          console.log('No animations found in the model.')
      }
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error)
    }
  )
}

// --- 動畫循環 --- (保持不變)
const animate = () => {
  requestAnimationFrame(animate)

  if (mixer.value && clock.value) {
    const delta = clock.value.getDelta()

    if (isAtTop.value) {
      mixer.value.update(delta)
    } else {
      if (animations.value.length > 0) {
        animations.value.forEach(animation => {
          const animationDuration = animation.duration
          const targetTime = scrollProgress.value * animationDuration
          const action = mixer.value.existingAction(animation)
          if (action) {
            action.time = targetTime
          }
        })
        mixer.value.update(0)
      }
    }
  }

  if (renderer.value && scene.value && camera.value) {
    renderer.value.render(scene.value, camera.value)
  }
}

// --- 滾動事件處理 ---
const handleScroll = () => {
  const container = scrollContainer.value;
  if (!container) return;

  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;

  const maxScroll = scrollHeight - clientHeight;
  const progress = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;
  scrollProgress.value = progress;

  currentSection.value = Math.floor(scrollTop / clientHeight);

  isAtTop.value = scrollTop < 50;
}


// --- 視窗大小改變處理 ---
const onWindowResize = () => {
  if (!camera.value || !renderer.value) return

  camera.value.aspect = window.innerWidth / window.innerHeight;
  camera.value.updateProjectionMatrix();

  renderer.value.setSize(
    window.innerWidth,
    window.innerHeight
  );

  handleScroll();
}

// --- Vue 生命周期鉤子 ---
onMounted(() => {
  if (threeContainer.value && scrollContainer.value) {
    initThree()
    loadModel()

    scrollContainer.value.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', onWindowResize)
    handleScroll()
  } else {
    console.error("Three.js 或 Scroll 容器 DOM 引用為 null onMounted. 請檢查 template 中的 ref 綁定。");
  }
})

onBeforeUnmount(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll);
  }
  window.removeEventListener('resize', onWindowResize)

  if (renderer.value) {
    renderer.value.dispose()
    if (scene.value) {
      scene.value.traverse((object) => {
        if (object.isMesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => {
                  material.map && material.map.dispose();
                  material.lightMap && material.lightMap.dispose();
                  material.bumpMap && material.bumpMap.dispose();
                  material.normalMap && material.normalMap.dispose();
                  material.specularMap && material.specularMap.dispose();
                  material.envMap && material.envMap.dispose();
                  material.dispose();
              });
            } else {
              object.material.map && object.material.map.dispose();
              object.material.lightMap && object.material.lightMap.dispose();
              object.material.bumpMap && object.material.bumpMap.dispose();
              object.material.normalMap && object.material.normalMap.dispose();
              object.material.specularMap && object.material.specularMap.dispose();
              object.material.envMap && object.material.envMap.dispose();
              object.material.dispose();
            }
          }
        }
      });
    }
  }
  mixer.value = null;
  model.value = null;
  scene.value = null;
  camera.value = null;
  renderer.value = null;
  clock.value = null;
  animations.value = [];
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>
