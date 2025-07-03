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
        v-for="(item, i) in props.items"
        :ref="el => {
          if (!cards.value) cards.value = []
          cards.value[i] = el
        }"
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
import { ref, shallowRef , computed, onMounted, watch } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  visibleCount: { type: Number, default: 7 },
  translateOffset: { type: Number, default: 80 },
  containerWidth: { type: String, default: '' }
})

const centerIndex = ref(0)
const cards = shallowRef([])

const total = computed(() => props.items.length)
const visible = computed(() => Math.min(props.visibleCount, total.value))
const half = computed(() => Math.floor(visible.value / 2))

const containerWidthStyle = computed(() => {
  const cardWidthNum = 300
  const gap = 30
  return `${visible.value * (cardWidthNum + gap)}px`
})

function getCardStyle(i) {
  let offset = i - centerIndex.value

  if (offset > half.value) offset -= total.value
  if (offset < -half.value) offset += total.value

  if (Math.abs(offset) > half.value) {
    return {
      opacity: 0,
      pointerEvents: 'none',
      transition: 'opacity 0.4s ease'
    }
  }

  const scale = 1 - Math.abs(offset) * 0.15
  const translateX = offset * props.translateOffset
  const zIndex = 100 - Math.abs(offset)
  const blur = Math.abs(offset) === half.value ? 'blur(2px)' : 'none'

  return {
    transform: `translateX(${translateX}%) scale(${scale})`,
    zIndex,
    filter: blur,
    opacity: 1,
    pointerEvents: 'auto',
    transition: 'transform 0.4s ease, z-index 0.4s ease, filter 0.4s ease, opacity 0.4s ease'
  }
}

function next() {
  centerIndex.value = (centerIndex.value + 1) % total.value
}

function prev() {
  centerIndex.value = (centerIndex.value - 1 + total.value) % total.value
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

watch(() => props.items, () => {
  updateStyles()
})
</script>
