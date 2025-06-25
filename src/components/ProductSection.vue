<template>
  <section class="bg-white py-16 px-6 md:px-24">
    <!-- Swiper 輪播區 -->
    <Swiper
      :modules="[ Autoplay, Navigation, Pagination ]"
      :slides-per-view="1"
      :loop="true"
      class="mb-10"
      :autoplay="{ delay: 3000 }"
      :pagination="true"
      :navigation="true"
    >
      <SwiperSlide v-for="slide in slides" :key="slide.id">
        <img :src="slide.image" :alt="slide.alt" class="max-h-80 w-full object-cover rounded-lg my-auto" />
      </SwiperSlide>
    </Swiper>

    <!-- 產品列表 -->
    <h2 class="text-3xl font-bold text-center mb-10">商用跑步機</h2>
    <div class="grid md:grid-cols-2 gap-8">
      <RouterLink
        v-for="product in products"
        :key="product.id"
        :to="`/product/${product.id}`"
        class="border rounded-lg p-4 shadow hover:shadow-lg transition block"
      >
        <img :src="product.image" :alt="product.name" />
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


const slides = [
  { id: 1, image: 'https://picsum.photos/1920/1080/?random=1', alt: 'Banner 1' },
  { id: 2, image: 'https://picsum.photos/1920/1080/?random=2', alt: 'Banner 2' },
  { id: 3, image: 'https://picsum.photos/1920/1080/?random=3', alt: 'Banner 3' },
]

const products = [
  {
    id: 'a',
    name: '跑步機型號 A',
    image: 'https://picsum.photos/1920/1080/?random=1',
    description: '高效馬達，穩定訓練體驗。',
  },
  {
    id: 'b',
    name: '跑步機型號 B',
    image: 'https://picsum.photos/1920/1080/?random=2',
    description: '多段阻力調整，專業健身房首選。',
  },
  {
    id: 'c',
    name: '跑步機型號 C',
    image: 'https://picsum.photos/1920/1080/?random=3',
    description: '現代設計，適合企業健身空間。',
  },
  {
    id: 'd',
    name: '跑步機型號 D',
    image: 'https://picsum.photos/1920/1080/?random=4',
    description: '現代設計，適合企業健身空間。',
  },
]
</script>

