<template>
  <!-- 外層容器：包含輪播卡片與左右按鈕 -->
  <div class="max-w-[600px] mx-auto relative overflow-hidden">
    <div class="relative h-[400px] md:h-[500px] sm:h-[400px]
      flex justify-center items-center"
      style="perspective: 1000px;">
      <div v-for="(item, index) in visibleItems" :key="item.realIndex"
        class="absolute rounded-xl overflow-hidden shadow-lg
          w-[300px] sm:w-[280px] md:w-[350px]
          h-[420px] sm:h-[380px] md:h-[420px]"
          :style="getStyle(item.offset)">
        <img :src="item.image" class="w-full h-full object-cover" />
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
import { ref, computed } from 'vue'

/**
 * 傳入 props：
 * - items：圖片陣列（必要）
 * - idPrefix：用來組合唯一 id 的字串（可選）
 * - visibleCount：同時顯示幾張圖（預設 3 張，可改 5、7）
 */
const props = defineProps({
  items: { type: Array, required: true },
  idPrefix: { type: String, default: '' },
  visibleCount: { type: Number, default: 3 },
  translateOffset: { type: Number, default: 50 }
})

// 當前中間卡片的 index（中心位置）
const centerIndex = ref(0)

const half = computed(() => Math.floor(props.visibleCount / 2))

/**
 * 計算畫面中應顯示的圖片資料
 * 用 centerIndex 決定左右各顯示幾張
 */
const visibleItems = computed(() => {
  const result = []
  const total = props.items.length

  for (let offset = -half.value; offset <= half.value; offset++) {
    // 對應實際圖片索引（避免超出邊界）
    const realIndex = (centerIndex.value + offset + total) % total

    result.push({
      realIndex,                  // ✅ 用來當 key，避免動畫破壞
      image: props.items[realIndex],
      offset,                     // 偏移量，用來算動畫
    })
  }

  return result
})

/**
 * 根據偏移量，計算卡片的動畫樣式：
 * - 位置（左右偏移）
 * - 縮放（邊緣變小）
 * - 模糊（最外層模糊）
 * - z-index（中間在最上層）
 */
function getStyle(offset) {
  const scale = 1 - Math.abs(offset) * 0.15
  const translateX = offset * props.translateOffset
  const zIndex = 100 - Math.abs(offset)
  const blur = Math.abs(offset) >= half.value ? 'blur(2px)' : 'none'

  return {
    transform: `translateX(${translateX}%) scale(${scale})`,
    zIndex,
    filter: blur,
    transition: 'transform 0.4s ease, z-index 0.4s ease, filter 0.4s ease',
  }
}

// 向右切換
function next() {
  centerIndex.value = (centerIndex.value + 1) % props.items.length
}

// 向左切換
function prev() {
  centerIndex.value = (centerIndex.value - 1 + props.items.length) % props.items.length
}
</script>

<style scoped>

</style>
