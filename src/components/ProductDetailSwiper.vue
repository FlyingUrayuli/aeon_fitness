<template>
  <div class="w-full overflow-hidden">
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
</style>
