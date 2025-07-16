<!-- heroanimation.vue -->
<template>
  <div ref="heroAnimationContainer" class="fixed inset-0 w-screen h-screen overflow-hidden">
    <div class="absolute inset-0 bg-transparent z-0">
      <div ref="threeContainer" class="w-full h-full"></div>
    </div>

    <div ref="scrollContainer" class="absolute inset-0 overflow-y-scroll scrollbar-none z-10 pointer-events-auto">
      <div :style="{ height: `${features.length * 100}vh` }">
        <FeatureSection
          v-for="(feature, index) in features"
          :key="index"
          :index="index"
          :id="'feature-section-' + index"
          :title="feature.title"
          :description="feature.description"
          :scrollerElement="scrollContainer"
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
const clock = shallowRef(null)

// 儲存特定動畫的 AnimationAction
const cameraAnimationAction = shallowRef(null);
const motorAnimationAction = shallowRef(null);
const motorCoverAnimationAction = shallowRef(null);
const armatureAnimationAction = shallowRef(null);

// **確保這個變數宣告是正確的，並且存在於此處**
const sphereLightMotor = shallowRef(null);

// 跑帶紋理材質控制相關變數
const beltTexture = shallowRef(null);
const textureScrollSettings = ref({
  enabled: false,
  direction: 'v',
  speed: 0.05,
  reverse: false
});
const materialOffset = ref({ u: 0, v: 0 });

// 滾動相關的響應式變數
const scrollProgress = ref(0)
const isAtTop = ref(true)

const scrollContainer = ref(null)
const heroAnimationContainer = ref(null)

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

  // 馬達區塊的照明：現在完全使用 THREE.PointLight (球面光)
  // **此處使用 sphereLightMotor.value，確保 sphereLightMotor 變數已在上方宣告**
  sphereLightMotor.value = new THREE.PointLight(0xffffff, 25, 2);
  sphereLightMotor.value.position.set(-0.4, 0.6, -0.2);
  sphereLightMotor.value.castShadow = true;

  sphereLightMotor.value.shadow.mapSize.width = 512;
  sphereLightMotor.value.shadow.mapSize.height = 512;
  sphereLightMotor.value.shadow.camera.near = 0.1;
  sphereLightMotor.value.shadow.camera.far = 10;

  sphereLightMotor.value.visible = false;
  scene.value.add(sphereLightMotor.value);
}

// --- 模型載入 ---
const loadModel = () => {
  const loader = new GLTFLoader()
  loader.load(
    selectedModel.value,
    (gltf) => {
      console.log('Model loaded:', gltf)
      model.value = gltf.scene

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
      if (camera.value) {
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

      if (gltf.animations && gltf.animations.length > 0) {
        mixer.value = new THREE.AnimationMixer(model.value);

        console.log('Available animations in GLB:', gltf.animations.map(anim => anim.name));

        const cameraClip = gltf.animations.find(anim => anim.name === 'Camera');
        if (cameraClip) {
          console.log('Found camera animation:', cameraClip.name);
          const action = mixer.value.clipAction(cameraClip);
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.play();
          action.enabled = false;
          cameraAnimationAction.value = action;
        } else {
          console.log('No camera animation found with name "Camera".');
        }

        const beltClip = gltf.animations.find(anim => anim.name === 'belt');
        if (beltClip) {
          console.warn('Found "belt" animation in GLB, but it will not be used or processed. Its native playback is intentionally ignored.');
        }

        const motorClip = gltf.animations.find(anim => anim.name === 'motor');
        if (motorClip) {
          console.log('Found motor animation:', motorClip.name);
          const action = mixer.value.clipAction(motorClip);
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.play();
          action.enabled = false;
          motorAnimationAction.value = action;
        } else {
          console.log('No motor animation found with name "motor".');
        }

        const motorCoverClip = gltf.animations.find(anim => anim.name === 'motor_cover');
        if (motorCoverClip) {
          console.log('Found motor_cover animation:', motorCoverClip.name);
          const action = mixer.value.clipAction(motorCoverClip);
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.play();
          action.enabled = false;
          motorCoverAnimationAction.value = action;
        } else {
          console.log('No motor_cover animation found with name "motor_cover".');
        }

        const armatureClip = gltf.animations.find(anim => anim.name === 'Armature');
        if (armatureClip) {
          console.log('Found Armature animation:', armatureClip.name);
          const action = mixer.value.clipAction(armatureClip);
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

      animate();
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error);
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.value = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.value.position.set(0, 1, 2.25);
      camera.value.lookAt(0, 0.5, 0);
      animate();
    }
  )
}

// --- 跑帶紋理滾動控制函數 ---
const updateTextureScroll = () => {
  if (!textureScrollSettings.value.enabled || !beltTexture.value || !beltTexture.value.map) return

  const direction = textureScrollSettings.value.direction
  const speed = textureScrollSettings.value.speed * (textureScrollSettings.value.reverse ? -1 : 1)

  materialOffset.value[direction] += speed

  materialOffset.value[direction] %= 1;
  if (materialOffset.value[direction] < 0) {
    materialOffset.value[direction] += 1;
  }

  if (direction === 'u') {
    beltTexture.value.map.offset.x = materialOffset.value[direction]
  } else {
    beltTexture.value.map.offset.y = materialOffset.value[direction]
  }

  beltTexture.value.map.needsUpdate = true
}

// --- 動畫循環 ---
const animate = () => {
  requestAnimationFrame(animate)

  updateTextureScroll()

  if (mixer.value && clock.value) {
    const delta = clock.value.getDelta()

    const armaturePart = model.value ? model.value.getObjectByName('Armature') : null;

    if (isAtTop.value) {
      if (armatureAnimationAction.value) {
        armatureAnimationAction.value.enabled = true;
        const armatureDuration = armatureAnimationAction.value.getClip().duration;
        const loopEnd = armatureDuration * 0.79;

        armatureAnimationAction.value.time += delta * 0.2;

        if (armatureAnimationAction.value.time >= loopEnd) {
          armatureAnimationAction.value.time = 0;
        }
        armatureAnimationAction.value.paused = false;
        if (armaturePart) armaturePart.visible = true;
      }
      textureScrollSettings.value.enabled = true;

      mixer.value.update(delta);

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
      // 檢查 sphereLightMotor.value 是否存在
      if (sphereLightMotor.value) {
        sphereLightMotor.value.visible = false;
      }
    } else {
      const clientHeight = scrollContainer.value.clientHeight;

      textureScrollSettings.value.enabled = true;

      if (cameraAnimationAction.value) {
        const cameraDuration = cameraAnimationAction.value.getClip().duration;
        cameraAnimationAction.value.enabled = true;
        cameraAnimationAction.value.time = scrollProgress.value * cameraDuration;
      }

      if (armatureAnimationAction.value) {
        if (currentSection.value < 2) {
          armatureAnimationAction.value.enabled = true;
          const armatureDuration = armatureAnimationAction.value.getClip().duration;
          const loopEnd = armatureDuration * 0.79;

          armatureAnimationAction.value.time += delta;

          if (armatureAnimationAction.value.time >= loopEnd) {
            armatureAnimationAction.value.time = 0;
          }
          armatureAnimationAction.value.paused = false;
          if (armaturePart) armaturePart.visible = true;

        } else {
          armatureAnimationAction.value.enabled = false;
          armatureAnimationAction.value.paused = true;
          if (armaturePart) armaturePart.visible = false;
        }
      }

      // 檢查 motorAnimationAction.value, motorCoverAnimationAction.value, 和 sphereLightMotor.value 是否都存在
      if (motorAnimationAction.value && motorCoverAnimationAction.value && sphereLightMotor.value) {
        if (currentSection.value === 1) {
          const motorDuration = motorAnimationAction.value.getClip().duration;
          const motorCoverDuration = motorCoverAnimationAction.value.getClip().duration;
          const progressWithinCurrentSection = (scrollContainer.value.scrollTop - clientHeight) / clientHeight;

          motorAnimationAction.value.enabled = true;
          motorAnimationAction.value.time = progressWithinCurrentSection * motorDuration;

          motorCoverAnimationAction.value.enabled = true;
          motorCoverAnimationAction.value.time = progressWithinCurrentSection * motorCoverDuration; // 已修正拼寫錯誤

          sphereLightMotor.value.visible = true;
        } else {
          motorAnimationAction.value.enabled = false;
          motorCoverAnimationAction.value.enabled = false;
          sphereLightMotor.value.visible = false;
          if (motorAnimationAction.value.getClip()) {
            motorAnimationAction.value.time = (currentSection.value > 1) ? motorAnimationAction.value.getClip().duration : 0;
            motorCoverAnimationAction.value.time = (currentSection.value > 1) ? motorCoverAnimationAction.value.getClip().duration : 0;
          }
        }
      } else if (sphereLightMotor.value) { // 這裡也要確保 sphereLightMotor.value 存在才操作
        sphereLightMotor.value.visible = false;
      }

      mixer.value.update(0);
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
  cameraAnimationAction.value?.stop();
  motorAnimationAction.value?.stop();
  motorCoverAnimationAction.value?.stop();
  armatureAnimationAction.value?.stop();

  if (mixer.value) {
    mixer.value.stopAllAction();
    mixer.value.uncacheRoot(mixer.value.getRoot());
  }

  // **清理 sphereLightMotor 資源**
  if (sphereLightMotor.value) {
    scene.value.remove(sphereLightMotor.value);
    sphereLightMotor.value = null;
  }

  mixer.value = null;
  model.value = null;
  scene.value = null;
  camera.value = null;
  renderer.value = null;
  clock.value = null;
  beltTexture.value = null;
})
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* 隱藏滾動條但保留滾動功能 */
.scrollbar-none {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.scrollbar-none::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
