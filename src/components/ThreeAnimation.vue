<template>
  <div class="w-full h-96 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
    <div ref="threeContainer" class="w-full h-full cursor-grab active:cursor-grabbing"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const props = defineProps({
  modelPath: {
    type: String,
    required: true
  }
})

const threeContainer = ref(null)
const scene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const model = shallowRef(null)

const isMouseDown = ref(false)
const mouseX = ref(0)
const rotationY = ref(0)

const initThree = () => {
  scene.value = new THREE.Scene()
  scene.value.background = new THREE.Color(0x1f2937)

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
    props.modelPath,
    (gltf) => {
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
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error)
    }
  )
}

const animate = () => {
  requestAnimationFrame(animate)
  if (renderer.value && scene.value && camera.value) {
    renderer.value.render(scene.value, camera.value)
  }
}

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

const onWindowResize = () => {
  if (!camera.value || !renderer.value) return

  camera.value.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
  camera.value.updateProjectionMatrix()
  renderer.value.setSize(
    threeContainer.value.clientWidth,
    threeContainer.value.clientHeight
  )
}

const addEventListeners = () => {
  const container = threeContainer.value
  container.addEventListener('mousedown', onMouseDown)
  container.addEventListener('mousemove', onMouseMove)
  container.addEventListener('mouseup', onMouseUp)
  container.addEventListener('mouseleave', onMouseUp)
  window.addEventListener('resize', onWindowResize)
}

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

onMounted(() => {
  initThree()
  loadModel()
  addEventListeners()
})

onBeforeUnmount(() => {
  removeEventListeners()
  if (renderer.value) {
    renderer.value.dispose()
  }
})
</script>
