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
const motorAnimationAction = shallowRef(null);
const motorCoverAnimationAction = shallowRef(null);
const armatureAnimationAction = shallowRef(null);

// 跑帶紋理材質控制相關變數
const beltTexture = shallowRef(null); // 已改名
const textureScrollSettings = ref({
  enabled: false, // 初始為 false，滾動時才啟用
  direction: 'v', // 'u' (水平), 'v' (垂直)
  speed: 0.2, // 調整這個值來控制滾動速度
  reverse: false
});
const materialOffset = ref({ u: 0, v: 0 });

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

// --- Three.js 初始化 ---
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

          // 尋找並保存 Material.005，設定其貼圖為可重複
          if (child.material && child.material.name === 'Material.005') {
            beltTexture.value = child.material;
            console.log('Found Material.005 (now referred to as beltTexture):', beltTexture.value);
            if (beltTexture.value.map) {
              beltTexture.value.map.wrapS = THREE.RepeatWrapping;
              beltTexture.value.map.wrapT = THREE.RepeatWrapping;
              beltTexture.value.map.needsUpdate = true;
              console.log('beltTexture map set to repeat wrapping');
            }
          }
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

        // 已移除查找和處理 "belt" 原生動畫的邏輯
        const beltClip = gltf.animations.find(anim => anim.name === 'belt');
        if (beltClip) {
            console.warn('Found "belt" animation in GLB, but it will not be used or processed. Its native playback is intentionally ignored.');
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
          // 為了手動控制循環，將其設定為 LoopOnce 並 clampWhenFinished
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true; // 確保播放完畢後停留在最後一幀
          action.play(); // 立即播放
          armatureAnimationAction.value = action; // 儲存起來以備後續控制
        } else {
          console.log('No Armature animation found with name "Armature".');
        }

      } else {
          console.log('No animations found in the model.');
      }

      animate(); // 在攝影機和模型動畫設定完成後，才啟動動畫循環
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

// 跑帶紋理滾動控制函數
const updateTextureScroll = () => {
  if (!textureScrollSettings.value.enabled || !beltTexture.value || !beltTexture.value.map) return

  const direction = textureScrollSettings.value.direction
  const speed = textureScrollSettings.value.speed * (textureScrollSettings.value.reverse ? -1 : 1)

  // 更新 UV 偏移
  materialOffset.value[direction] += speed

  // 保持偏移值在 0-1 範圍內循環，避免浮點數過大
  materialOffset.value[direction] %= 1;
  if (materialOffset.value[direction] < 0) {
    materialOffset.value[direction] += 1;
  }

  // 應用到材質
  if (direction === 'u') {
    beltTexture.value.map.offset.x = materialOffset.value[direction]
  } else {
    beltTexture.value.map.offset.y = materialOffset.value[direction]
  }

  // 通知 Three.js 材質需要更新
  beltTexture.value.map.needsUpdate = true
}


// --- 動畫循環 ---
const animate = () => {
  requestAnimationFrame(animate)

  // 在每一幀更新材質紋理滾動
  updateTextureScroll()

  if (mixer.value && clock.value) {
    const delta = clock.value.getDelta()

    if (isAtTop.value) {
      console.log('State: At Top (isAtTop = true)');
      // 在頂部時，Armature 動畫自由循環播放
      if (armatureAnimationAction.value) {
        armatureAnimationAction.value.enabled = true;
        // 手動控制循環，確保只播放前80%
        const armatureDuration = armatureAnimationAction.value.getClip().duration;
        const loopEnd = armatureDuration * 0.79; // 循環到 80%

        // 遞增時間
        armatureAnimationAction.value.time += delta;

        // 如果時間超過了循環結束點，就重置到 0
        if (armatureAnimationAction.value.time >= loopEnd) {
          armatureAnimationAction.value.time = 0;
        }
        armatureAnimationAction.value.paused = false; // 確保沒有暫停
      }
      // 在頂部時，跑帶貼圖動畫啟用
      textureScrollSettings.value.enabled = true;

      mixer.value.update(0); // 手動更新 Three.js 原生動畫，不遞增時間

      // 其他動畫在頂部時禁用並重置
      if (cameraAnimationAction.value) {
          cameraAnimationAction.value.enabled = false;
          cameraAnimationAction.value.time = 0;
      }
      if (motorAnimationAction.value) {
          motorAnimationAction.value.enabled = false;
          motorAnimationAction.value.time = 0;
      }
      if (motorCoverAnimationAction.value) {
          motorCoverAnimationAction.value.enabled = false;
          motorCoverAnimationAction.value.time = 0;
      }
      // mixer.value.update(0); // 手動更新一次 mixer 以應用 time = 0 和 enabled 狀態
      // 注意：這裡不需要額外的 mixer.update(0)，因為 armatureAnimationAction 的時間是手動控制的，
      // 且其他動畫在 isAtTop 狀態下被重置為 0 並禁用，它們不會在 mixer.update(delta) 中前進。
      // 為了確保動畫狀態立即更新，可以考慮在設定 time 和 enabled 後調用 mixer.update(0)。
      // 但由於 animate 循環會持續調用 mixer.update(delta) (或這裡的 0)，通常不是問題。

    } else { // 不在頂部時（滾動中）
      console.log('State: Scrolling');
      const clientHeight = scrollContainer.value.clientHeight;
      const scrollTop = scrollContainer.value.scrollTop;

      // 滾動時，跑帶貼圖動畫啟用
      textureScrollSettings.value.enabled = true;

      // 攝影機動畫：貫穿整個滾動進度 (0% - 100% 的 HeroAnimation 內部滾動)
      if (cameraAnimationAction.value) {
        const cameraDuration = cameraAnimationAction.value.getClip().duration;
        cameraAnimationAction.value.enabled = true; // 始終啟用
        cameraAnimationAction.value.time = scrollProgress.value * cameraDuration;
        console.log(`Camera Animation: Enabled=true, Time=${cameraAnimationAction.value.time.toFixed(2)}`);
      }

      // Armature 動畫：根據滾動進度在 Section 0 和 1 播放，Section 2 後隱藏
      if (armatureAnimationAction.value) {
        const armatureDuration = armatureAnimationAction.value.getClip().duration;
        const armaturePart = model.value ? model.value.getObjectByName('Armature') : null;

        // 設定動畫循環的結束點為總時長的 80%
        const loopEnd = armatureDuration * 0.8;

        if (currentSection.value < 2) { // 當 currentSection 是 0 或 1 時播放
          armatureAnimationAction.value.enabled = true;
          armatureAnimationAction.value.paused = false;

          // 計算基於滾動進度的動畫時間，並確保在 0 到 loopEnd 之間循環
          // 將 scrollProgress 映射到 0 到 1 的範圍，然後乘以 loopEnd
          // 這裡我們讓它在整個滾動進度中都保持循環，直到超過某個點
          // 為了實現 "只播放動畫的80%並循環播放"，我們需要將滾動進度映射到這個 80% 的範圍內
          // 例如，如果 scrollProgress 從 0 到 1，我們希望動畫時間在 0 到 loopEnd 之間循環
          // 最簡單的方法是讓它自由播放，但當超過 loopEnd 時重置
          armatureAnimationAction.value.time += delta; // 讓動畫時間遞增
          if (armatureAnimationAction.value.time >= loopEnd) {
            armatureAnimationAction.value.time = 0; // 重置到動畫開頭
          }

          if (armaturePart) armaturePart.visible = true; // 確保可見

        } else { // 當 currentSection >= 2 時，隱藏 Armature 模型
          armatureAnimationAction.value.enabled = false;
          // 停留在 80% 的最後一幀，而不是完全的最後一幀
          armatureAnimationAction.value.time = loopEnd;
          armatureAnimationAction.value.paused = true;
          if (armaturePart) armaturePart.visible = false; // 設定為不可見
        }
      }

      // motor 和 motor_cover 動畫：在 currentSection === 1 時播放
      if (motorAnimationAction.value && motorCoverAnimationAction.value) {
        if (currentSection.value === 1) {
          const motorDuration = motorAnimationAction.value.getClip().duration;
          const motorCoverDuration = motorCoverAnimationAction.value.getClip().duration;
          const progressWithinCurrentSection = (scrollTop - clientHeight) / clientHeight; // 針對 Section 1 計算進度

          motorAnimationAction.value.enabled = true;
          motorAnimationAction.value.time = progressWithinCurrentSection * motorDuration;

          motorCoverAnimationAction.value.enabled = true;
          motorCoverAnimationAction.value.time = progressWithinCurrentSection * motorCoverDuration;
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
        }
      }

      mixer.value.update(0); // 手動更新 Three.js 原生動畫，不遞增時間
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
            // 處理單一材質或陣列材質
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach(material => {
                if (material.map) material.map.dispose();
                material.dispose();
            });
          }
        }
      });
    }
  }
  // 停止並清理所有 AnimationAction (如果定義了)
  cameraAnimationAction.value?.stop();
  motorAnimationAction.value?.stop();
  motorCoverAnimationAction.value?.stop();
  armatureAnimationAction.value?.stop();

  if (mixer.value) {
      mixer.value.stopAllAction();
      mixer.value.uncacheRoot(mixer.value.getRoot());
  }

  mixer.value = null;
  model.value = null;
  scene.value = null;
  camera.value = null;
  renderer.value = null;
  clock.value = null;
  beltTexture.value = null; // 清理材質引用
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>
