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

<template>
  <div>
    <VideoScroll :totalFeatureSectionsHeight="totalFeatureSectionsCalculatedHeight" />

    <div ref="featureSectionsWrapper" class="relative z-10 bg-transparent">
      <FeatureSection title="AI 掃描技術" subtitle="重新定義 3D 精度與速度" />
      <FeatureSection title="毫米級定位" subtitle="追求極致的感知精度" />
      <FeatureSection title="立即體驗" subtitle="開啟您的全新 3D 掃描旅程" />
      <FeatureSection title="立即體" subtitle="開啟您的全新 3D 掃描旅程" />
      <FeatureSection title="立體驗" subtitle="開啟您的全新 3D 掃描旅程" />
      <FeatureSection title="即體驗" subtitle="開啟您的全新 3D 掃描旅程" />
    </div>



  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import VideoScroll from '../components/VideoScroll.vue';
import FeatureSection from '../components/FeatureSection.vue';

import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const featureSectionsWrapper = ref(null);
const totalFeatureSectionsCalculatedHeight = ref(0);

onMounted(() => {
  nextTick(() => {
    if (featureSectionsWrapper.value) {
      totalFeatureSectionsCalculatedHeight.value = featureSectionsWrapper.value.offsetHeight;
      // console.log('Home.vue: totalFeatureSectionsHeight', totalFeatureSectionsCalculatedHeight.value);
    } else {
      console.warn('Home.vue: featureSectionsWrapper not found.');
    }
    ScrollTrigger.refresh();
  });
});
</script>

<style>
html, body {
  overflow-x: hidden;
}
</style>
