<template>
  <div class="flex flex-col md:flex-row gap-10 px-6 py-20 min-h-screen">
    <!-- 左側圖片 -->
    <div class="md:w-1/2">
      <img
        :src="currentImage"
        class="w-full h-auto rounded shadow mb-4 object-contain"
        :alt="product.name"
      />
      <div class="flex gap-2">
        <img
          v-for="(img, i) in product.image"
          :key="i"
          :src="img"
          @click="currentImage = img"
          class="w-20 h-20 rounded border cursor-pointer object-cover hover:opacity-80"
          :class="{ 'ring-2 ring-blue-500': currentImage === img }"
        />
      </div>
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

const route = useRoute()
const id = route.params.id

const product = products.find(p => p.id === id)
const currentImage = ref(product?.image[0] ?? '')
</script>
