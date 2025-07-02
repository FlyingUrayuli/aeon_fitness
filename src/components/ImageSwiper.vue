<template>
  <div class="max-w-[600px] mx-auto relative overflow-hidden">
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
      >
        <img :src="item" class="w-full h-full object-cover" />
      </div>
    </div>

    <button @click="prev"
      class="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30
        text-white text-4xl rounded px-3 py-1 z-20 cursor-pointer
        select-none">‹</button>
    <button @click="next"
      class="absolute top-1/2 right-2 -translate-y-1/2
        bg-black/30 text-white text-4xl rounded px-3 py-1 z-20
        cursor-pointer select-none">›</button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  visibleCount: { type: Number, default: 3 },
  translateOffset: { type: Number, default: 50 }
})

const centerIndex = ref(0)
const cards = ref([])

const half = Math.floor(props.visibleCount / 2)

/**
 * 計算並更新每張卡片的位置與樣式
 */
function updateStyles() {
  const total = props.items.length

  cards.value.forEach((el, i) => {
    const rawOffset = i - centerIndex.value
    let offset = rawOffset

    // 處理環繞邏輯
    if (offset > half) offset -= total
    if (offset < -half) offset += total

    const scale = 1 - Math.abs(offset) * 0.15
    const translateX = offset * props.translateOffset
    const zIndex = 100 - Math.abs(offset)
    const blur = Math.abs(offset) >= half ? 'blur(2px)' : 'none'

    el.style.transform = `translateX(${translateX}%) scale(${scale})`
    el.style.zIndex = zIndex
    el.style.filter = blur
    el.style.transition = 'transform 0.4s ease, z-index 0.4s ease, filter 0.4s ease'
  })
}

// 切換函數
function next() {
  centerIndex.value = (centerIndex.value + 1) % props.items.length
  updateStyles()
}

function prev() {
  centerIndex.value = (centerIndex.value - 1 + props.items.length) % props.items.length
  updateStyles()
}

onMounted(() => {
  updateStyles()
})
</script>
