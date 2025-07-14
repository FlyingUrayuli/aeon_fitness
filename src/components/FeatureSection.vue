<!-- src/components/FeatureSection.vue -->
<template>
  <section
    :id="id"
    class="h-screen flex flex-col items-center justify-center px-4 text-center relative bg-transparent z-10"
  >
    <div
      ref="textWrapper"
      class="opacity-0 transform translate-y-10 transition-all duration-700 max-w-2xl"
    >
      <h2 class="text-4xl md:text-5xl font-bold text-black mb-4">
        {{ title }}
      </h2>
      <p class="text-lg md:text-xl text-gray-700">
        {{ description }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  id: String,
  title: String,
  description: String,
  scrollerElement: Object, // <--- 新增：接收滾動器元素
})

const textWrapper = ref(null)
let trigger = null

onMounted(async () => {
  await nextTick()

  const triggerEl = document.getElementById(props.id)
  // 確保 triggerEl 和 textWrapper.value 都存在
  // 並且 scrollerElement 也存在，才創建 ScrollTrigger
  if (!triggerEl || !textWrapper.value || !props.scrollerElement) {
    console.warn(`FeatureSection ${props.id}: Missing trigger element, text wrapper, or scroller element. ScrollTrigger not created.`);
    return;
  }

  trigger = ScrollTrigger.create({
    trigger: triggerEl,
    scroller: props.scrollerElement, // <--- 關鍵：指定監聽的滾動器
    start: 'top 70%',
    end: 'bottom center',
    toggleActions: 'play reverse play reverse',
    onEnter: () => {
      gsap.to(textWrapper.value, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      })
    },
    onLeaveBack: () => {
      gsap.to(textWrapper.value, {
        opacity: 0,
        y: 40,
        duration: 0.5,
        ease: 'power2.in',
      })
    },
  })
})

onUnmounted(() => {
  trigger?.kill() // 組件卸載時，確保殺死 ScrollTrigger 實例
})
</script>

<style scoped>
/* 根據需要添加樣式 */
</style>
