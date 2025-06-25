<template>
  <section ref="heroRef" class="relative h-[800px] md:h-[1200px] overflow-visible">
    <!-- Three.js 動畫 Canvas -->
    <ThreeAnimation
      :width="width"
      :height="height"
      :pinTriggerEl="pinTriggerEl"
    />

    <!-- 文字與按鈕，蓋在 Canvas 上 -->
    <div class="relative z-10 max-w-4xl mx-auto text-center pt-32 text-white">
      <h1 class="text-5xl font-bold mb-6 drop-shadow-lg">Welcome to Hero Section</h1>
      <button class="px-8 py-4 bg-black bg-opacity-60 rounded hover:bg-opacity-80 transition">
        Demo Button
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watchEffect } from 'vue'
import ThreeAnimation from './ThreeAnimation.vue'

const heroRef = ref(null)
const width = ref(0)
const height = ref(0)
const pinTriggerEl = ref(null)

function updateSize() {
  if (!heroRef.value) return
  width.value = heroRef.value.clientWidth
  height.value = heroRef.value.clientHeight
}

onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize)
})

watchEffect(() => {
  if (heroRef.value) {
    pinTriggerEl.value = heroRef.value
  }
})
</script>

<style scoped>
section {
  background: transparent;
  overflow: visible;
}
</style>

