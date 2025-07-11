<template>
  <div class="bg-gray-600 text-white p-8 rounded-lg shadow-lg mb-8">
    <!-- 標題區 -->
    <div v-if="type === 'title'" class="text-center">
      <div class="flex justify-center items-center mb-6">
        <svg class="w-12 h-12 text-blue-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        <h1 class="text-4xl font-bold text-stfangsong">{{ data.name }}</h1>
      </div>
      <p class="text-xl text-gray-300 font-stfangsong">{{ data.slogan }}</p>
    </div>

    <!-- 圖片展示區 -->
    <div v-else-if="type === 'images'" class="max-w-6xl mx-auto">
      <div class="flex items-center mb-6">
        <svg class="w-10 h-10 text-yellow-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <h2 class="text-3xl font-bold text-stfangsong">產品展示</h2>
      </div>
      <ProductDetailSwiper :images="data.image" />
    </div>

    <!-- 3D模型展示區 -->
    <div v-else-if="type === 'model'" class="max-w-6xl mx-auto">
      <div class="flex items-center mb-6">
        <svg class="w-10 h-10 text-cyan-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
        </svg>
        <h2 class="text-3xl font-bold text-stfangsong">3D 模型展示</h2>
      </div>
      <p class="text-gray-300 mb-6 font-stfangsong">拖拽滑鼠水平轉動，全方位觀看產品</p>
      <ThreeAnimation :modelPath="data.modelPath" />
    </div>

    <!-- 避震技術 -->
    <div v-else-if="type === 'shock'" class="max-w-4xl mx-auto">
      <div class="flex items-center mb-6">
        <svg class="w-10 h-10 text-green-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h2 class="text-3xl font-bold text-stfangsong">{{ data.shockAbsorption.title }}</h2>
      </div>
      <p class="text-lg text-gray-300 mb-6 leading-relaxed font-stfangsong">
        {{ data.shockAbsorption.description }}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(feature, index) in data.shockAbsorption.features"
          :key="index"
          class="flex items-center bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors duration-300"
        >
          <svg class="w-6 h-6 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span class="font-stfangsong">{{ feature }}</span>
        </div>
      </div>
    </div>

    <!-- 控制面板特色 -->
    <div v-else-if="type === 'control'" class="max-w-4xl mx-auto">
      <div class="flex items-center mb-6">
        <svg class="w-10 h-10 text-purple-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        <h2 class="text-3xl font-bold text-stfangsong">{{ data.controlPanel.title }}</h2>
      </div>
      <p class="text-lg text-gray-300 mb-6 leading-relaxed font-stfangsong">
        {{ data.controlPanel.description }}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(feature, index) in data.controlPanel.features"
          :key="index"
          class="flex items-center bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors duration-300"
        >
          <svg class="w-6 h-6 text-purple-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <span class="font-stfangsong">{{ feature }}</span>
        </div>
      </div>
    </div>

    <!-- 動力與坡度表現 -->
    <div v-else-if="type === 'power'" class="max-w-4xl mx-auto">
      <div class="flex items-center mb-6">
        <svg class="w-10 h-10 text-red-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        <h2 class="text-3xl font-bold text-stfangsong">{{ data.powerAndIncline.title }}</h2>
      </div>
      <p class="text-lg text-gray-300 mb-6 leading-relaxed font-stfangsong">
        {{ data.powerAndIncline.description }}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(feature, index) in data.powerAndIncline.features"
          :key="index"
          class="flex items-center bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors duration-300"
        >
          <svg class="w-6 h-6 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span class="font-stfangsong">{{ feature }}</span>
        </div>
      </div>
    </div>

    <!-- CTA收尾區 -->
    <div v-else-if="type === 'cta'" class="text-center">
      <div class="flex justify-center items-center mb-6">
        <svg class="w-12 h-12 text-blue-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <h2 class="text-3xl font-bold text-stfangsong">聯繫我們</h2>
      </div>
      <p class="text-xl text-gray-300 mb-8 font-stfangsong">
        想了解更多產品資訊或獲得專業建議？
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
          立即諮詢
        </button>
        <button class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          加入購物車
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import ProductDetailSwiper from './ProductDetailSwiper.vue'
import ThreeAnimation from './ThreeAnimation.vue'

defineProps({
  type: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
})
</script>


<style scoped>
.font-stfangsong {
  font-family: 'STFangsong', 'FangSong', serif;
}
</style>
