<template>
  <section class="bg-white py-16 px-6 md:px-24">
    <ImageSwiper :items="slides"
      :translateOffset="80"
      containerWidth="w-full"
      :autoplay="true"
      :autoplayInterval="1000" />

    <!-- 產品列表 -->
    <h2 class="text-3xl font-bold text-center mb-10">商用跑步機</h2>
    <div class="grid md:grid-cols-2 gap-8">
      <RouterLink v-for="product in products" :key="product.id" :to="`/product/${product.id}`"
        class="border rounded-lg p-4 shadow hover:shadow-lg transition block">
        <img :src="product.image[0]" :alt="product.name" class="w-full h-100 object-contain" />
        <div class="mt-4">
          <h3 class="text-xl font-semibold mb-2">{{ product.name }}</h3>
          <p class="text-gray-600">{{ product.description }}</p>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<script setup>

import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { slides, products } from '@/data/product.js'
import ImageSwiper from './ImageSwiper.vue'

</script>
