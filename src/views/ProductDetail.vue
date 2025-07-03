<template>
  <div class="flex flex-col md:flex-row gap-6 px-6 py-20 min-h-screen">
    <!-- 左側圖片 -->
    <div class="md:w-1/2">
      <ImageSwiper
        :items="product.image"
        :id-prefix="id" />
    </div>

    <!-- 右側產品資訊 -->
    <div class="md:w-1/2">
      <h1 class="text-3xl font-bold mb-4">{{ product.name }}</h1>
      <ul class="list-disc pl-5 text-left text-gray-700 space-y-1 mb-6">
        <li v-for="(feature, i) in product.features" :key="i">
          {{ feature }}
        </li>
      </ul>

      <h2 class="text-xl font-semibold mb-2">產品規格</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-left text-gray-600">
        <div v-for="(value, key) in product.specs" :key="key">
          <strong>{{ key }}：</strong> {{ value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { products } from '@/data/product.js'
import ImageSwiper from '@/components/ImageSwiper.vue'

const route = useRoute()
// http://localhost:3000/products/id
const id = route.params.id    // 來自網址參數
// 從 products 陣列中，找出 id 等於網址參數 id 的那一筆資料回傳
const product = products.find(p => p.id === id)
</script>
