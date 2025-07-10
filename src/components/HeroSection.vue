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

<!-- src/components/HeroSection.vue -->
<template>
  <div>
    <section ref="sectionRef" class="relative h-[200vh]">
      <!-- 無限循環影片 -->
      <video
        v-if="!playTriggered"
        ref="loopVideoRef"
        class="fixed top-0 left-0 w-full h-screen object-cover z-10"
        autoplay
        muted
        loop
        playsinline
      >
        <source :src="loopVideoSrc" type="video/mp4" />
      </video>
    </section>

    <!-- 單一 canvas 用來 render 所有 frame -->
    <VideoScroll :sections="sections" />

    <!-- 對應每段影片的文字說明 -->
    <div v-for="(section, index) in sections" :key="index">
      <FeatureSection :title="section.title" :index="index" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VideoScroll from './VideoScroll.vue'
import FeatureSection from './FeatureSection.vue'

const playTriggered = ref(false)
const loopVideoRef = ref(null)
const loopVideoSrc = '/video/循環.mp4' // 請改成你影片的正確路徑

const base = 'https://ik.imagekit.io/FlyingUrayuli'

const sections = [
  {
    title: '第一段內容',
    folder: `${base}/video/frame-1`,
    frameCount: 150,
    startFrame: 1,
  },
  {
    title: '第二段內容',
    folder: `${base}/video/frame-2`,
    frameCount: 150,
    startFrame: 151,
  },
  {
    title: '第段內容',
    folder: `${base}/video/frame-3`,
    frameCount: 150,
    startFrame: 301,
  },
  {
    title: '第二段容',
    folder: `${base}/video/frame-4`,
    frameCount: 150,
    startFrame: 451,
  },
  {
    title: '第二段內',
    folder: `${base}/video/frame-5`,
    frameCount: 150,
    startFrame: 601,
  },
  {
    title: '二段內容',
    folder: `${base}/video/frame-6`,
    frameCount: 150,
    startFrame: 751,
  },
  {
    title: '段內容',
    folder: `${base}/video/frame-7`,
    frameCount: 150,
    startFrame: 901,
  },
]
</script>
