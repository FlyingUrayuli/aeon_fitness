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
            'opacity-100': currentSection === (index + 1), // FeatureSection 的 index 從 0 開始，但 currentSection 0 是初始空白頁
            'opacity-0': currentSection !== (index + 1)
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
const camera = shallowRef(null) // 攝影機將從 GLB 載入或設定
const renderer = shallowRef(null)
const model = shallowRef(null)
const mixer = shallowRef(null)
const clock = shallowRef(null)

// 儲存特定動畫的 AnimationAction
const cameraAnimationAction = shallowRef(null);
const beltAnimationAction = shallowRef(null);
const motorAnimationAction = shallowRef(null);
const motorCoverAnimationAction = shallowRef(null);
const armatureAnimationAction = shallowRef(null);

// 滾動相關的響應式變數
const scrollProgress = ref(0) // 總體滾動進度 (0-1)
const isAtTop = ref(true) // 是否在頁面頂部 (滾動條位置 < 50px)

const scrollContainer = ref(null)
const heroAnimationContainer = ref(null)

// currentSection 表示當前滾動到的 h-screen 區塊索引
// 0: 初始空白頁 (scrollTop < clientHeight)
// 1: 第一個 FeatureSection (clientHeight <= scrollTop < 2*clientHeight)
// 2: 第二個 FeatureSection (2*clientHeight <= scrollTop < 3*clientHeight), 以此類推
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
      if (gltf.cameras && gltf.cameras.length > 0) {
        camera.value = gltf.cameras[0];
        console.log('Using GLB camera:', camera.value);
        camera.value.aspect = window.innerWidth / window.innerHeight;
        camera.value.updateProjectionMatrix();
      } else {
        console.warn('No camera found in GLB model. Using default Three.js camera.');
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.value = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.value.position.set(0, 1, 2.25);
        camera.value.lookAt(0, 0.5, 0);
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

      // 2. 處理動畫 (包括攝影機動畫和分階段播放的物件動畫)
      if (gltf.animations && gltf.animations.length > 0) {
        mixer.value = new THREE.AnimationMixer(model.value);

        console.log('Available animations in GLB:', gltf.animations.map(anim => anim.name));

        // 查找並設定攝影機動畫
        const cameraClip = gltf.animations.find(anim => anim.name === 'Camera');
        if (cameraClip) {
          console.log('Found camera animation:', cameraClip.name);
          const action = mixer.value.clipAction(cameraClip);
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.play();
          action.enabled = false; // 初始禁用，由滾動控制
          cameraAnimationAction.value = action;
        } else {
          console.log('No camera animation found with name "Camera".');
        }

        // 查找並設定 belt 動畫
        const beltClip = gltf.animations.find(anim => anim.name === 'belt');
        if (beltClip) {
          console.log('Found belt animation:', beltClip.name);
          const action = mixer.value.clipAction(beltClip);
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.play();
          action.enabled = false; // 初始禁用
          beltAnimationAction.value = action;
        } else {
          console.log('No belt animation found with name "belt".');
        }

        // 查找並設定 motor 動畫
        const motorClip = gltf.animations.find(anim => anim.name === 'motor');
        if (motorClip) {
          console.log('Found motor animation:', motorClip.name);
          const action = mixer.value.clipAction(motorClip);
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.play();
          action.enabled = false; // 初始禁用
          motorAnimationAction.value = action;
        } else {
          console.log('No motor animation found with name "motor".');
        }

        // 查找並設定 motor_cover 動畫
        const motorCoverClip = gltf.animations.find(anim => anim.name === 'motor_cover');
        if (motorCoverClip) {
          console.log('Found motor_cover animation:', motorCoverClip.name);
          const action = mixer.value.clipAction(motorCoverClip);
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.play();
          action.enabled = false; // 初始禁用
          motorCoverAnimationAction.value = action;
        } else {
          console.log('No motor_cover animation found with name "motor_cover".');
        }

        // 查找並設定 Armature 動畫
        const armatureClip = gltf.animations.find(anim => anim.name === 'Armature');
        if (armatureClip) {
          console.log('Found Armature animation:', armatureClip.name);
          const action = mixer.value.clipAction(armatureClip);
          action.setLoop(THREE.LoopRepeat); // 滾動前重複播放
          action.play(); // 立即播放
          armatureAnimationAction.value = action; // 儲存起來以備後續控制
        } else {
          console.log('No Armature animation found with name "Armature".');
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
      console.log('State: At Top (isAtTop = true)');
      // 在頂部時，只有 Armature 動畫自由循環播放
      if (armatureAnimationAction.value) {
        armatureAnimationAction.value.enabled = true;
        armatureAnimationAction.value.setLoop(THREE.LoopRepeat); // 無限循環
        armatureAnimationAction.value.paused = false; // 確保沒有暫停
        // 在 isAtTop 時，Armature 的時間讓 mixer 自己更新
      }
      mixer.value.update(delta); // 更新 Armature 的時間

      // 其他動畫在頂部時禁用並重置
      if (cameraAnimationAction.value) {
          cameraAnimationAction.value.enabled = false;
          cameraAnimationAction.value.time = 0;
      }
      if (beltAnimationAction.value) {
          beltAnimationAction.value.enabled = false;
          beltAnimationAction.value.time = 0;
      }
      if (motorAnimationAction.value) {
          motorAnimationAction.value.enabled = false;
          motorAnimationAction.value.time = 0;
      }
      if (motorCoverAnimationAction.value) {
          motorCoverAnimationAction.value.enabled = false;
          motorCoverAnimationAction.value.time = 0;
      }
      mixer.value.update(0); // 手動更新一次 mixer 以應用 time = 0 和 enabled 狀態

    } else { // 不在頂部時（滾動中）
      console.log('State: Scrolling');
      const clientHeight = scrollContainer.value.clientHeight;
      const scrollTop = scrollContainer.value.scrollTop;

      const progressWithinCurrentSection = (scrollTop % clientHeight) / clientHeight;

      console.log(`currentSection: ${currentSection.value}`);
      console.log(`scrollTop: ${scrollTop}, clientHeight: ${clientHeight}, progressWithinCurrentSection: ${progressWithinCurrentSection.toFixed(2)}`);

      // 攝影機動畫：貫穿整個滾動進度 (0% - 100% 的 HeroAnimation 內部滾動)
      if (cameraAnimationAction.value) {
        const cameraDuration = cameraAnimationAction.value.getClip().duration;
        cameraAnimationAction.value.enabled = true; // 始終啟用
        cameraAnimationAction.value.time = scrollProgress.value * cameraDuration;
        console.log(`Camera Animation: Enabled=true, Time=${cameraAnimationAction.value.time.toFixed(2)}`);
      }

      // --- Armature 動畫的修改開始 ---
      if (armatureAnimationAction.value) {
        const armatureDuration = armatureAnimationAction.value.getClip().duration;
        const armaturePart = model.value ? model.value.getObjectByName('Armature') : null; // 找到Armature部分

        if (currentSection.value < 2) { // 當 currentSection 是 0 或 1 時播放
          armatureAnimationAction.value.enabled = true;
          armatureAnimationAction.value.setLoop(THREE.LoopOnce); // 滾動後播放一次
          armatureAnimationAction.value.clampWhenFinished = true;
          armatureAnimationAction.value.time = scrollProgress.value * armatureDuration;
          armatureAnimationAction.value.paused = false; // 確保沒有暫停
          console.log(`Armature Animation: Enabled=true (Section < 2), Time=${armatureAnimationAction.value.time.toFixed(2)}`);

          // 確保 Armature 模型在 Section 0 或 1 時是可見的
          if (armaturePart) armaturePart.visible = true;

        } else { // 當 currentSection >= 2 時，隱藏 Armature 模型
          armatureAnimationAction.value.enabled = false;
          // 這行設定時間到動畫結束，但由於 visible=false，實際不可見。
          // 這樣做是為了保證內部狀態的一致性，如果未來需要瞬間顯示最後一幀，會正確。
          armatureAnimationAction.value.time = armatureDuration;
          armatureAnimationAction.value.paused = true; // 暫停動畫
          console.log(`Armature Animation: Enabled=false (Section >= 2), Time=${armatureAnimationAction.value.time.toFixed(2)}`);

          // 將 Armature 模型設定為不可見 - 這是讓它完全不顯示的關鍵
          if (armaturePart) armaturePart.visible = false;
        }
      }
      // --- Armature 動畫的修改結束 ---


      // belt 動畫：在 currentSection === 0 時播放
      if (beltAnimationAction.value) {
        if (currentSection.value === 0) {
          const beltDuration = beltAnimationAction.value.getClip().duration;
          beltAnimationAction.value.enabled = true;
          beltAnimationAction.value.time = progressWithinCurrentSection * beltDuration;
          console.log(`Belt Animation: Enabled=true, Time=${beltAnimationAction.value.time.toFixed(2)}`);
        } else {
          beltAnimationAction.value.enabled = false;
          if (scrollProgress.value > 0 && beltAnimationAction.value.getClip()) {
              beltAnimationAction.value.time = beltAnimationAction.value.getClip().duration;
          } else {
              beltAnimationAction.value.time = 0;
          }
          console.log(`Belt Animation: Enabled=false, Clamped Time=${beltAnimationAction.value.time.toFixed(2)}`);
        }
      }

      // motor 和 motor_cover 動畫：在 currentSection === 1 時播放 (第一個 FeatureSection)
      if (motorAnimationAction.value && motorCoverAnimationAction.value) {
        if (currentSection.value === 1) {
          const motorDuration = motorAnimationAction.value.getClip().duration;
          const motorCoverDuration = motorCoverAnimationAction.value.getClip().duration;

          motorAnimationAction.value.enabled = true;
          motorAnimationAction.value.time = progressWithinCurrentSection * motorDuration;

          motorCoverAnimationAction.value.enabled = true;
          motorCoverAnimationAction.value.time = progressWithinCurrentSection * motorCoverDuration;
          console.log(`Motor/Cover Animation: Enabled=true, Time=${motorAnimationAction.value.time.toFixed(2)}`);
        } else {
          motorAnimationAction.value.enabled = false;
          motorCoverAnimationAction.value.enabled = false;
          if (currentSection.value > 1 && motorAnimationAction.value.getClip()) {
              motorAnimationAction.value.time = motorAnimationAction.value.getClip().duration;
              motorCoverAnimationAction.value.time = motorCoverAnimationAction.value.getClip().duration;
          } else {
              motorAnimationAction.value.time = 0;
              motorCoverAnimationAction.value.time = 0;
          }
          console.log(`Motor/Cover Animation: Enabled=false, Reset/Clamped Time=${motorAnimationAction.value.time.toFixed(2)}`);
        }
      }

      mixer.value.update(0); // 手動更新 mixer，不遞增時間
    }
  }

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

  // currentSection 的計算方式：
  // 0: 初始空白頁 (0 <= scrollTop < clientHeight)
  // 1: 第一個 FeatureSection (clientHeight <= scrollTop < 2*clientHeight)
  // 2: 第二個 FeatureSection (2*clientHeight <= scrollTop < 3*clientHeight), 以此類推
  currentSection.value = Math.floor(scrollTop / clientHeight);

  isAtTop.value = scrollTop < 50; // 判斷是否在頁面頂部
}


// --- 視窗大小改變處理 --- (保持不變)
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
  // 停止並清理所有 AnimationAction
  cameraAnimationAction.value?.stop();
  beltAnimationAction.value?.stop();
  motorAnimationAction.value?.stop();
  motorCoverAnimationAction.value?.stop();
  armatureAnimationAction.value?.stop();

  mixer.value = null;
  model.value = null;
  scene.value = null;
  camera.value = null;
  renderer.value = null;
  clock.value = null;
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>
