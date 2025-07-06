<template>
  <section
    ref="sectionRef"
    class="h-screen flex flex-col justify-center items-center text-center
           bg-white/80 backdrop-blur-md text-gray-900 relative z-10">
    <h2 class="text-4xl font-bold mb-4 opacity-0 translate-y-10">{{ title }}</h2>
    <p class="text-lg opacity-0 translate-y-10">{{ subtitle }}</p>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  title: String,
  subtitle: String
})

const sectionRef = ref(null)

onMounted(() => {
  const el = sectionRef.value
  const h2 = el.querySelector('h2')
  const p = el.querySelector('p')

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    }
  })

  tl.to(h2, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    .to(p, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
})
</script>
