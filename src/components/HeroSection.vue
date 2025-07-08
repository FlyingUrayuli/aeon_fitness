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
  {
    src: '/video/0001-0660_0.mp4',
    totalFrames: 104,
    fps: 30,
    text: '第一段文字',
  },
  {
    src: '/video/0001-0660_104.mp4',
    totalFrames: 43,
    fps: 30,
    text: '第二段文字',
  },
  {
    src: '/video/0001-0660_146.mp4',
    totalFrames: 75,
    fps: 30,
    text: '第二段文字',
  },
]
</script>
