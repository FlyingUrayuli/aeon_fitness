<template>
  <div
    :class="[containerWidth || '', 'mx-auto relative overflow-hidden']"
    :style="{ maxWidth: containerWidthStyle }"
  >
    <div
      ref="cardContainer"
      class="relative h-[400px] md:h-[500px] sm:h-[400px] flex justify-center items-center"
      style="perspective: 1000px;"
    >
      <div
        v-for="(item, i) in items"
        ref="cards"
        :data-index="i"
        class="absolute rounded-xl overflow-hidden shadow-lg
          w-[300px] sm:w-[280px] md:w-[350px]
          h-[420px] sm:h-[380px] md:h-[420px]"
        :style="getCardStyle(i)"
      >
        <img :src="item" class="w-full h-full object-cover" />
      </div>
    </div>

    <button @click="prev"
      class="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30
        text-white text-4xl rounded px-3 py-1 z-20 cursor-pointer select-none">‹</button>
    <button @click="next"
      class="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30
        text-white text-4xl rounded px-3 py-1 z-20 cursor-pointer select-none">›</button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  visibleCount: { type: Number, default: 7 },
  translateOffset: { type: Number, default: 80 },
  containerWidth: { type: String, default: '' }
})

const centerIndex = ref(0)
const cards = ref([])

const half = Math.floor(props.visibleCount / 2)

const containerWidthStyle = computed(() => {
  // 這邊簡單用預設卡片寬度加間距算寬度，也可以根據需要調整
  const cardWidthNum = 300
  const gap = 30
  return `${props.visibleCount * (cardWidthNum + gap)}px`
})

function getCardStyle(i) {
  const total = props.items.length
  let offset = i - centerIndex.value

  if (offset > half) offset -= total
  if (offset < -half) offset += total

  const scale = 1 - Math.abs(offset) * 0.15
  const translateX = offset * props.translateOffset
  const zIndex = 100 - Math.abs(offset)
  const blur = Math.abs(offset) >= half ? 'blur(2px)' : 'none'

  return {
    transform: `translateX(${translateX}%) scale(${scale})`,
    zIndex,
    filter: blur,
    transition: 'transform 0.4s ease, z-index 0.4s ease, filter 0.4s ease'
  }
}

function next() {
  centerIndex.value = (centerIndex.value + 1) % props.items.length
}

function prev() {
  centerIndex.value = (centerIndex.value - 1 + props.items.length) % props.items.length
}

function updateStyles() {
  cards.value.forEach((el, i) => {
    if (!el) return
    Object.assign(el.style, getCardStyle(i))
  })
}

onMounted(() => {
  updateStyles()
})

watch(centerIndex, () => {
  updateStyles()
})
</script>
