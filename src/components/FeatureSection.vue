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
  index: Number,
  scrollerElement: Object,
})

const textWrapper = ref(null)
let trigger = null

onMounted(async () => {
  await nextTick()

  const triggerEl = document.getElementById(props.id)
  if (!triggerEl || !textWrapper.value || !props.scrollerElement) return

  // 不同 section 使用不同 start
  const startValue = props.index === 0 ? 'top top' : 'top 90%'

  trigger = ScrollTrigger.create({
    trigger: triggerEl,
    scroller: props.scrollerElement,
    start: startValue,
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
    // 額外保險（快速滾動補觸發）
    onUpdate: (self) => {
      if (self.isActive && parseFloat(getComputedStyle(textWrapper.value).opacity) < 1) {
        gsap.to(textWrapper.value, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power1.out',
        })
      }
    }
  })

  // 一開始判斷是否需要手動顯示（特別針對第一個 section）
  const bounds = triggerEl.getBoundingClientRect()
  const scrollerBounds = props.scrollerElement.getBoundingClientRect()
  const triggerTop = bounds.top - scrollerBounds.top
  const scrollerHeight = scrollerBounds.height

  const shouldShow =
    props.index === 0
      ? triggerTop <= 0
      : triggerTop <= scrollerHeight * 0.9

  if (shouldShow) {
    gsap.set(textWrapper.value, { opacity: 1, y: 0 })
  }
})

onUnmounted(() => {
  trigger?.kill()
})
</script>
