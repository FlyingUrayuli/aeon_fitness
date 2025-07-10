<template>
  <canvas ref="canvasRef" class="fixed top-0 left-0 w-full h-screen z-10 pointer-events-none" />
</template>

<script setup>

import { onMounted, ref, nextTick } from 'vue'
import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  sections: Array,
  loopVideoRef: Object,
})

const canvasRef = ref()
const playTriggered = ref(false)

function hideLoopVideo() {
  playTriggered.value = true
  if (props.loopVideoRef?.value) {
    props.loopVideoRef.value.style.display = 'none'
  }
}

onMounted(async () => {
  await nextTick()
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  for (let i = 0; i < props.sections.length; i++) {
    const section = props.sections[i]
    const images = [] // 用於 lazy preload 緩存

    ScrollTrigger.create({
      trigger: document.body,
      start: `top+=${i * 1000} top`,
      end: `+=1000`,
      scrub: true,

      onEnter: () => {
        if (!playTriggered.value && i === 0) {
          hideLoopVideo()
        }
      },

      onUpdate: async self => {
        const frame = Math.floor(self.progress * (section.frameCount - 1))

        // 若該 frame 尚未載入則載入
        if (!images[frame]) {
          const img = new Image()
          const frameNumber = (section.startFrame || 0) + frame

          img.src = `${section.folder}/${String(frameNumber).padStart(4, '0')}.webp`
          await new Promise(resolve => {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          })
          images[frame] = img

        }

        const img = images[frame]
        if (img && img.complete) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
      },
    })
  }
})

</script>
