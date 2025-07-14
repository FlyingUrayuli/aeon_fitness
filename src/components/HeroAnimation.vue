<!-- heroanimation.vue -->
<template>
  <div ref="heroAnimationContainer" class="fixed inset-0 w-screen h-screen overflow-hidden">

    <div class="absolute inset-0 bg-transparent z-0">
      <div ref="threeContainer" class="w-full h-full"></div>
    </div>

    <div ref="scrollContainer" class="absolute inset-0 overflow-y-scroll z-10 pointer-events-auto">
      <div :style="{ height: `${(1 + features.length) * 100}vh` }">
        <div class="h-screen w-full bg-transparent"></div>

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
          :scroller-element="scrollContainer"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import modelUrl from '@/assets/video_AZ50_ver11.glb?url'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

import FeatureSection from './FeatureSection.vue'
import { features } from '../data/product.js';

gsap.registerPlugin(ScrollTrigger);

const selectedModel = ref(modelUrl)

// Three.js 相關的響應式變數
const threeContainer = ref(null)
const scene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const model = shallowRef(null)
const mixer = shallowRef(null)
const animations = shallowRef([]) // 儲存所有受滾動控制的 AnimationClip
const clock = shallowRef(null)

const cameraAnimationAction = shallowRef(null); // 儲存攝影機動畫的 AnimationAction

// 滾動相關的響應式變數
const scrollProgress = ref(0)
const isAtTop = ref(true)

const scrollContainer = ref(null)
const heroAnimationContainer = ref(null)

const currentSection = ref(0)

// --- Three.js 初始化 --- (保持不變)
const initThree = () => {
  scene.value = new THREE.Scene()
  scene.value.background = new THREE.Color(0xffffff)
  clock.value = new THREE.Clock()

  const width = window.innerWidth;
  const height = window.innerHeight;

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
}

// --- 模型載入 ---
const loadModel = () => {
  const loader = new GLTFLoader()
  loader.load(
    selectedModel.value,
    (gltf) => {
      console.log('Model loaded:', gltf)
      model.value = gltf.scene

      // 1. 設定攝影機 (從 GLB 或備用)
      // 增加穩健性檢查：確保 gltf.cameras 存在且非空
      if (gltf.cameras && gltf.cameras.length > 0) {
        camera.value = gltf.cameras[0]; // 使用模型中的第一個攝影機
        console.log('Using GLB camera:', camera.value);
        // 確保攝影機的 aspect ratio 與視窗一致
        camera.value.aspect = window.innerWidth / window.innerHeight;
        camera.value.updateProjectionMatrix();
        // 將攝影機添加到場景中，這樣它的動畫才能被 mixer 找到並控制
        // 如果攝影機已經是場景的一部分，這行是多餘的，但通常不會造成問題
        // gltf.scene.add(camera.value); // 或者 scene.value.add(camera.value);
      } else {
        console.warn('No camera found in GLB model. Using default Three.js camera.');
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.value = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.value.position.set(0, 1, 2.25); // 備用攝影機位置
        camera.value.lookAt(0, 0.5, 0); // 備用攝影機看向目標
      }

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

      // 2. 處理動畫 (包括攝影機動畫)
      if (gltf.animations && gltf.animations.length > 0) {
        mixer.value = new THREE.AnimationMixer(model.value); // Mixer 作用於主模型

        const playingAnimationClips = []; // 儲存受滾動控制的動畫片段

        // 嘗試找到攝影機動畫 (根據名稱 'Camera')
        const foundCameraAnimation = gltf.animations.find(anim =>
          anim.name === 'Camera' // 精確匹配名稱
        );

        if (foundCameraAnimation) {
          console.log('Found camera animation:', foundCameraAnimation.name);
          // 確保攝影機是 mixer 的目標，或者將攝影機添加到模型中
          // 如果攝影機是場景的一部分，mixer 應該能找到它
          const action = mixer.value.clipAction(foundCameraAnimation);
          action.setLoop(THREE.LoopOnce); // 攝影機動畫通常只播放一次
          action.clampWhenFinished = true; // 結束時保持最後一幀
          action.play(); // 播放一次以激活動畫，但我們會手動控制時間
          action.paused = true; // 初始暫停，由滾動控制
          cameraAnimationAction.value = action; // 儲存 action
          playingAnimationClips.push(foundCameraAnimation); // 將攝影機動畫片段加入列表
        } else {
          console.log('No camera animation found with name "Camera".');
        }

        // 現有的模型動畫邏輯 (Armature, belt)
        const armatureAnimation = gltf.animations.find(anim =>
          anim.name === 'Armature' // 精確匹配名稱
        );
        if (armatureAnimation) {
          console.log('Playing Armature animation:', armatureAnimation.name);
          const armatureAction = mixer.value.clipAction(armatureAnimation);
          armatureAction.setLoop(THREE.LoopRepeat); // 模型動畫循環播放
          armatureAction.play();
          playingAnimationClips.push(armatureAnimation);
        } else {
          console.log('Armature animation not found with name "Armature".');
        }

        const beltAnimation = gltf.animations.find(anim =>
          anim.name === 'belt' // 精確匹配名稱
        );
        if (beltAnimation) {
          console.log('Playing belt animation:', beltAnimation.name);
          const beltAction = mixer.value.clipAction(beltAnimation);
          beltAction.setLoop(THREE.LoopRepeat); // 模型動畫循環播放
          beltAction.play();
          playingAnimationClips.push(beltAnimation);
        } else {
          console.log('belt animation not found with name "belt".');
        }

        if (playingAnimationClips.length > 0) {
          animations.value = playingAnimationClips; // 儲存所有受滾動控制的動畫片段
          console.log(`Controlling ${playingAnimationClips.length} animations simultaneously by scroll.`);
        } else {
          console.log('No target animations found or controlled by scroll.');
          // 備用：如果沒有找到受滾動控制的動畫，且有其他動畫，則播放第一個
          if (gltf.animations.length > 0) {
              const action = mixer.value.clipAction(gltf.animations[0]);
              action.setLoop(THREE.LoopRepeat);
              action.play();
              animations.value = [gltf.animations[0]]; // 仍然保留在 animations.value 以保持一致性
          }
        }
      } else {
          console.log('No animations found in the model.');
      }

      // 在攝影機和模型動畫設定完成後，才啟動動畫循環
      animate();
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error);
      // 如果模型載入失敗，也設定備用攝影機，防止渲染器崩潰
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.value = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.value.position.set(0, 1, 2.25);
      camera.value.lookAt(0, 0.5, 0);
      animate(); // 即使載入失敗，也啟動動畫循環
    }
  )
}

// --- 動畫循環 ---
const animate = () => {
  requestAnimationFrame(animate)

  if (mixer.value && clock.value) {
    const delta = clock.value.getDelta()

    if (isAtTop.value) {
      // 在頂部時，讓 mixer 自由更新循環動畫
      mixer.value.update(delta);
      // 將攝影機動畫重置到開始並暫停
      if (cameraAnimationAction.value) {
          cameraAnimationAction.value.time = 0;
          cameraAnimationAction.value.paused = true;
          // 確保攝影機位置/旋轉被重置到動畫的第一幀
          // 這一步很重要，因為 clampWhenFinished = true 會讓它停在最後一幀
          // 需要手動強制更新一次以應用 time = 0
          mixer.value.update(0);
      }
    } else {
      // 滾動時，手動控制動畫時間
      if (animations.value.length > 0) {
        animations.value.forEach(animationClip => {
          const animationDuration = animationClip.duration;
          const targetTime = scrollProgress.value * animationDuration;
          const action = mixer.value.existingAction(animationClip);
          if (action) {
            action.time = targetTime;
            action.paused = false; // 確保動畫未暫停
            action.enabled = true; // 確保動畫已啟用
          }
        });
        mixer.value.update(0); // 手動更新 mixer，不遞增時間
      }
    }
  }

  // 檢查攝影機是否已載入
  if (renderer.value && scene.value && camera.value) {
    renderer.value.render(scene.value, camera.value)
  }
}

// --- 滾動事件處理 --- (保持不變)
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
  // 檢查攝影機是否已載入
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
    initThree() // 初始化 Three.js 場景 (不包含攝影機)
    loadModel() // 載入 3D 模型並設定攝影機

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
