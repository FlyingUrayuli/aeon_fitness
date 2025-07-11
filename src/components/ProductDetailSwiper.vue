<template>
  <div class="w-full relative overflow-hidden">
    <!-- 左右按鈕固定在容器外層 -->
    <button @click="scrollLeft" class="nav-btn left-btn">‹</button>
    <button @click="scrollRight" class="nav-btn right-btn">›</button>

    <!-- swiper 內容 -->
    <div class="flex gap-4 overflow-x-auto scrollbar-hide pb-4" ref="swiperContainer">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="flex-shrink-0 w-80 h-64 bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <img
          :src="image"
          :alt="`產品圖片 ${index + 1}`"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
const swiperContainer = ref(null)

const scrollAmount = 300 // 每次滑動的距離

function scrollLeft() {
  if (swiperContainer.value) {
    swiperContainer.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  }
}

function scrollRight() {
  if (swiperContainer.value) {
    swiperContainer.value.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}
defineProps({
  images: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 2rem;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.2s ease, background-color 0.2s ease;
  pointer-events: auto; /* 可點擊 */
}

.nav-btn:hover {
  transform: translateY(-50%) scale(1.1);
  background-color: rgba(0, 0, 0, 0.6);
}

.left-btn {
  left: -10px;
}

.right-btn {
  right: -10px;
}

</style>
