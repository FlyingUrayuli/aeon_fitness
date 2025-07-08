<!-- <template>
  <section ref="heroRef" class="relative h-[600px] overflow-hidden">
    <ThreeAnimation :width="width" :height="height" :pinTriggerEl="pinTriggerEl" />
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
</script> -->

<!-- herosection,vue -->
<template>
  <div>
    <div v-for="(config, i) in videoConfigs" :key="i" class="relative">
      <VideoScroll
        :videoSrc="config.src"
        :totalFrames="config.totalFrames"
        :fps="config.fps"
        :triggerId="`section-${i}`"
      />
      <FeatureSection
        :text="config.text"
        :id="`section-${i}`"
      />
    </div>
  </div>
</template>

<script setup>
import VideoScroll from './VideoScroll.vue'
import FeatureSection from './FeatureSection.vue'

const videoConfigs = [
  // total frame: 700
  {
    src: '/video/0.mp4',
    totalFrames: 139,
    fps: 30,
    text: 'Section1',
  },
  {
    src: '/video/139.mp4',
    totalFrames: 112,
    fps: 30,
    text: 'Section2',
  },
  {
    src: '/video/250.mp4',
    totalFrames: 50,
    fps: 30,
    text: 'Section3',
  },
  {
    src: '/video/299.mp4',
    totalFrames: 153,
    fps: 30,
    text: 'Section4',
  },
  {
    src: '/video/451.mp4',
    totalFrames: 86,
    fps: 30,
    text: 'Section5',
  },
  {
    src: '/video/536.mp4',
    totalFrames: 63,
    fps: 30,
    text: 'Section6',
  },
  {
    src: '/video/598.mp4',
    totalFrames: 103,
    fps: 30,
    text: 'Section7',
  },
]
</script>
