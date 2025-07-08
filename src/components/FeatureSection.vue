<!-- featuresection.vue -->
<template>
  <section
    :id="id"
    class="h-screen flex items-center justify-center relative bg-transparent z-1"
  >
    <div
      class="opacity-0 transition-opacity duration-500 text-3xl font-bold text-black"
      :class="{ 'opacity-100': isVisible }"
    >
      {{ text }}
    </div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  text: String,
  id: String,
})

const isVisible = ref(false)
let currentTextScrollTrigger = null

onMounted(() => {
  watch(() => props.id, async (newId) => {
    await nextTick();

    const triggerEl = document.getElementById(newId)
    if (!triggerEl) {
      console.warn(`[FeatureSection] No trigger element found for ID: ${newId}.`);
      if (currentTextScrollTrigger) {
        currentTextScrollTrigger.kill();
        currentTextScrollTrigger = null;
      }
      return;
    }

    if (currentTextScrollTrigger) {
      currentTextScrollTrigger.kill();
      currentTextScrollTrigger = null;
    }

    console.log(`[FeatureSection] Setting ScrollTrigger for text: "${props.text}" with ID: ${newId}`);

    currentTextScrollTrigger = ScrollTrigger.create({
      trigger: triggerEl,
      start: 'top bottom', // 將這裡從 'center center' 改為 'top bottom'
      end: 'bottom center',
      toggleActions: 'play reverse play reverse',
      onEnter: () => {
        isVisible.value = true;
        console.log(`[FeatureSection] Text "${props.text}" entering.`);
      },
      onLeaveBack: () => {
        isVisible.value = false;
        console.log(`[FeatureSection] Text "${props.text}" leaving back.`);
      },
    });
  }, { immediate: true });
});

onUnmounted(() => {
  if (currentTextScrollTrigger) {
    currentTextScrollTrigger.kill();
    console.log(`[FeatureSection] Cleaned up text ScrollTrigger for: "${props.text}"`);
  }
});
</script>
