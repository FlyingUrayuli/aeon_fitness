<template>
  <div class="min-h-screen bg-black text-white">
    <div class="container mx-auto px-4 py-8">
      <!-- 根據路由參數找到對應產品 -->
      <div v-if="currentProduct" class="max-w-7xl mx-auto">
        <!-- 標題區 -->
        <ProductDetailSection
          type="title"
          :data="currentProduct"
        />

        <!-- 避震技術 -->
        <ProductDetailSection
          type="shock"
          :data="currentProduct"
        />

        <!-- 控制面板特色 -->
        <ProductDetailSection
          type="control"
          :data="currentProduct"
        />

        <!-- 動力與坡度表現 -->
        <ProductDetailSection
          type="power"
          :data="currentProduct"
        />

        <!-- 圖片展示區 -->
        <ProductDetailSection
          type="images"
          :data="currentProduct"
        />

        <!-- 3D模型展示區 -->
        <ProductDetailSection
          type="model"
          :data="currentProduct"
        />

        <!-- CTA收尾區 -->
        <ProductDetailSection
          type="cta"
          :data="currentProduct"
        />
      </div>

      <!-- 產品未找到 -->
      <div v-else class="text-center py-20">
        <div class="max-w-md mx-auto">
          <svg class="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h2 class="text-2xl font-bold text-gray-300 mb-4">產品未找到</h2>
          <p class="text-gray-400 mb-6">抱歉，無法找到您要查看的產品資訊。</p>
          <button
            @click="$router.push('/products')"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            返回產品列表
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { products } from '../data/product.js'
import ProductDetailSection from '../components/ProductDetailSection.vue'

const route = useRoute()
const router = useRouter()
const productList = ref(products)

const currentProduct = computed(() => {
  const productId = route.params.id
  return productList.value.find(product => product.id === productId)
})

watch(() => route.params.id, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}, { immediate: true })

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>


<style scoped>
.font-stfangsong {
  font-family: 'STFangsong', 'FangSong', serif;
}
</style>
