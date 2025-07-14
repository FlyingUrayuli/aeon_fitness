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

// 新增馬達動畫區塊的定向光
const directionalLightMotor = shallowRef(null);
const directionalLightMotorTarget = shallowRef(new THREE.Object3D());

// 跑帶紋理材質控制相關變數
const beltTexture = shallowRef(null); // 已改名
const textureScrollSettings = ref({
  enabled: false, // 初始為 false，滾動時才啟用
  direction: 'v', // 'u' (水平), 'v' (垂直)
  speed: 0.05, // **跑帶材質動畫速度已修改為 0.2**
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

  const mainDirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
  mainDirectionalLight.position.set(0, 10, 0)
  mainDirectionalLight.target.position.set(0, 0, 0);
  scene.value.add(mainDirectionalLight.target);
  mainDirectionalLight.castShadow = true
  mainDirectionalLight.shadow.mapSize.width = 1024;
  mainDirectionalLight.shadow.mapSize.height = 1024;
  mainDirectionalLight.shadow.camera.near = 0.5;
  mainDirectionalLight.shadow.camera.far = 50;
  mainDirectionalLight.shadow.camera.left = -5;
  mainDirectionalLight.shadow.camera.right = 5;
  mainDirectionalLight.shadow.camera.top = 5;
  mainDirectionalLight.shadow.camera.bottom = -5;
  mainDirectionalLight.shadow.bias = -0.0001;
  scene.value.add(mainDirectionalLight)

  // **將 directionalLightMotor 替換為 PointLight (球面光)**
  // directionalLightMotor.value 已經是 shallowRef(null) 了，可以直接賦值
  directionalLightMotor.value = new THREE.PointLight(0xffffff, 25, 2); // 顏色，強度，距離 (2 個單位後衰減為 0)
  // 將光源位置設定在馬達下方，比馬達的 Y 座標 0.90 低
  directionalLightMotor.value.position.set(-0.4, 0.6, -0.2); // Y 值設定為 0.5
  directionalLightMotor.value.castShadow = true; // 球面光也可以投射陰影

  // PointLight 的 shadow.camera 設置與 DirectionalLight 不同，
  // PointLight 的陰影攝像機是一個 PerspectiveCamera。
  directionalLightMotor.value.shadow.mapSize.width = 512;
  directionalLightMotor.value.shadow.mapSize.height = 512;
  directionalLightMotor.value.shadow.camera.near = 0.1; // 必須大於 0
  directionalLightMotor.value.shadow.camera.far = 10; // 影響陰影範圍，應大於光源的距離參數

  directionalLightMotor.value.visible = false; // 初始仍不可見
  scene.value.add(directionalLightMotor.value);
  // PointLight 沒有 target 屬性，因為它是從一個點向所有方向發散。
  // 所以 directionalLightMotorTarget 就不需要了，也不需要添加到場景中。
  // 但由於它在其他地方有引用，我們暫時保留它的宣告，只是不使用它。
  // 如果你確定不需要 directionalLightMotorTarget 了，可以在變數宣告時直接移除。
  // 目前它不會造成錯誤，因為 PointLight 不會使用它。
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
      // 更嚴謹地檢查 gltf.cameras[0] 是否有效
      if (gltf.cameras && gltf.cameras.length > 0 && gltf.cameras[0]) {
        camera.value = gltf.cameras[0];
        console.log('Using GLB camera:', camera.value);
      } else {
        console.warn('No valid camera found in GLB model or gltf.cameras[0] is undefined. Using default Three.js camera.');
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.value = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.value.position.set(0, 1, 2.25);
        camera.value.lookAt(0, 0.5, 0);
      }
      // 無論哪種情況，都更新攝影機的 Aspect Ratio
      if (camera.value) { // 增加一個防護，確保 camera.value 存在才設定屬性
          camera.value.aspect = window.innerWidth / window.innerHeight;
          camera.value.updateProjectionMatrix();
      } else {
          console.error("Camera is still undefined after loadModel attempt!");
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
          // 初始設定為播放一次並停留在最後一幀，時間由 animate 函數控制
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.play();
          action.enabled = true;
          armatureAnimationAction.value = action;
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
  materialOffset.value [direction] += speed

  // 保持偏移值在 0-1 範圍內循環，避免浮點數過大
  materialOffset.value [direction] %= 1;
  if (materialOffset.value [direction] < 0) {
    materialOffset.value [direction] += 1;
  }

  // 應用到材質
  if (direction === 'u') {
    beltTexture.value.map.offset.x = materialOffset.value [direction]
  } else {
    beltTexture.value.map.offset.y = materialOffset.value [direction]
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

    // 處理 Armature 模型的可見性
    const armaturePart = model.value ? model.value.getObjectByName('Armature') : null;

    if (isAtTop.value) {
      // console.log('State: At Top (isAtTop = true)');
      // 在頂部時，Armature 動畫播放前 79% 並循環
      if (armatureAnimationAction.value) {
        armatureAnimationAction.value.enabled = true;
        const armatureDuration = armatureAnimationAction.value.getClip().duration;
        const loopEnd = armatureDuration * 0.79; // **循環到 79% 處**

        armatureAnimationAction.value.time += delta * 0.2; // 讓動畫時間遞增

        // 如果時間超過了循環結束點，就重置到 0
        if (armatureAnimationAction.value.time >= loopEnd) {
          armatureAnimationAction.value.time = 0;
        }
        armatureAnimationAction.value.paused = false; // 確保沒有暫停
        if (armaturePart) armaturePart.visible = true; // 確保可見
      }
      // 在頂部時，跑帶貼圖動畫啟用
      textureScrollSettings.value.enabled = true;

      mixer.value.update(delta); // 更新 Three.js 原生動畫的時間

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
      if (directionalLightMotor.value) { // 確保光線物件存在才操作
        directionalLightMotor.value.visible = false; // 頂部時隱藏馬達光
      }
    } else { // 不在頂部時（滾動中）
      // console.log('State: Scrolling');
      const clientHeight = scrollContainer.value.clientHeight;
      // const scrollTop = scrollContainer.value.scrollTop; // 此處不再需要直接使用 scrollTop

      // 滾動時，跑帶貼圖動畫啟用
      textureScrollSettings.value.enabled = true;

      // 攝影機動畫：貫穿整個滾動進度 (0% - 100% 的 HeroAnimation 內部滾動)
      if (cameraAnimationAction.value) {
        const cameraDuration = cameraAnimationAction.value.getClip().duration;
        cameraAnimationAction.value.enabled = true; // 始終啟用
        cameraAnimationAction.value.time = scrollProgress.value * cameraDuration;
        // console.log(`Camera Animation: Enabled=true, Time=${cameraAnimationAction.value.time.toFixed(2)}`);
      }

      // Armature 動畫：在 Section 0 和 1 播放，Section 2 後隱藏
      if (armatureAnimationAction.value) {
        if (currentSection.value < 2) { // 當 currentSection 是 0 或 1 時播放
          armatureAnimationAction.value.enabled = true;
          const armatureDuration = armatureAnimationAction.value.getClip().duration;
          const loopEnd = armatureDuration * 0.79; // **循環到 79% 處**

          armatureAnimationAction.value.time += delta; // 讓動畫時間遞增

          // 如果時間超過了循環結束點，就重置到 0
          if (armatureAnimationAction.value.time >= loopEnd) {
            armatureAnimationAction.value.time = 0;
          }
          armatureAnimationAction.value.paused = false; // 確保沒有暫停
          if (armaturePart) armaturePart.visible = true; // 確保可見

        } else { // 當 currentSection >= 2 時，隱藏 Armature 模型
          armatureAnimationAction.value.enabled = false;
          armatureAnimationAction.value.paused = true; // 暫停動畫
          if (armaturePart) armaturePart.visible = false; // 設定為不可見
        }
      }

      // 馬達和馬達蓋動畫以及定向光的控制
      if (motorAnimationAction.value && motorCoverAnimationAction.value && directionalLightMotor.value) {
        if (currentSection.value === 1) {
          const motorDuration = motorAnimationAction.value.getClip().duration;
          const motorCoverDuration = motorCoverAnimationAction.value.getClip().duration;
          const progressWithinCurrentSection = (scrollContainer.value.scrollTop - clientHeight) / clientHeight; // 針對 Section 1 計算進度

          motorAnimationAction.value.enabled = true;
          motorAnimationAction.value.time = progressWithinCurrentSection * motorDuration;

          motorCoverAnimationAction.value.enabled = true;
          motorCoverAnimationAction.value.time = progressWithinCurrentSection * motorCoverDuration;

          directionalLightMotor.value.visible = true; // 在 Section 1 顯示馬達光
        } else {
          motorAnimationAction.value.enabled = false;
          motorCoverAnimationAction.value.enabled = false;
          directionalLightMotor.value.visible = false; // 在其他區塊隱藏馬達光
          // 當離開 Section 1 時，將馬達動畫設置為結束或開始，避免閃爍
          if (motorAnimationAction.value.getClip()) {
              motorAnimationAction.value.time = (currentSection.value > 1) ? motorAnimationAction.value.getClip().duration : 0;
              motorCoverAnimationAction.value.time = (currentSection.value > 1) ? motorCoverAnimationAction.value.getClip().duration : 0;
          }
        }
      } else if (directionalLightMotor.value) {
        directionalLightMotor.value.visible = false; // 如果動畫或光線物件未加載，也隱藏光線
      }

      // 在滾動時，手動更新 mixer，因為大部分動畫時間是手動設定的
      mixer.value.update(0);
    }
  }

  // const motorMesh = model.value ? model.value.getObjectByName('Cylinder') : null;
  //   if (motorMesh) {
  //       const worldPosition = new THREE.Vector3();
  //       motorMesh.getWorldPosition(worldPosition);

        // 每幀打印一次可能會造成控制台訊息過多，你可以調整打印頻率或僅在特定情況下打印
        // console.log(`馬達世界座標: X=${worldPosition.x.toFixed(2)}, Y=${worldPosition.y.toFixed(2)}, Z=${worldPosition.z.toFixed(2)}`);
    // }

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

  // 判斷當前在哪個 full-screen section
  currentSection.value = Math.floor(scrollTop / clientHeight);

  // 判斷是否在頁面頂部 (前 50px 範圍內)
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

  handleScroll(); // 視窗大小改變後重新計算滾動進度
}

// --- Vue 生命周期鉤子 ---
onMounted(() => {
  if (threeContainer.value && scrollContainer.value) {
    initThree()
    loadModel()

    scrollContainer.value.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', onWindowResize)
    handleScroll() // 初始載入時調用一次，設定初始狀態
  } else {
    console.error("Three.js 或 Scroll 容器 DOM 引用為 null onMounted. 請檢查 template 中的 ref 綁定。");
  }
})

onBeforeUnmount(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll);
  }
  window.removeEventListener('resize', onWindowResize)

  // 清理 Three.js 資源以防止內存洩漏
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

  // 移除馬達的定向光及其目標
  if (directionalLightMotor.value) {
    scene.value.remove(directionalLightMotor.value);
    directionalLightMotor.value = null;
  }
  if (directionalLightMotorTarget.value) {
    scene.value.remove(directionalLightMotorTarget.value);
    directionalLightMotorTarget.value = null;
  }

  // 清理所有引用
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
