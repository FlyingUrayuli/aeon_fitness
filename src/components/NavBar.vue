<template>
  <nav class="fixed top-0 w-full bg-transparent z-50 py-4 px-6 flex justify-between items-center">

    <!-- <div class="text-xl font-bold">LOGO</div> -->
    <RouterLink to="/">
      <img src="/logo.svg" alt="Logo" />
    </RouterLink>
    <div class="hidden md:flex gap-6" :class="{ 'opacity-0': scrolled }">
      <button class="text-gray-700 hover:text-black">
        <RouterLink to="/products">產品</RouterLink> <!-- 產品列表 -->
      </button>
      <button class="text-gray-700 hover:text-black">
        <RouterLink to="/cart">購物車</RouterLink>
      </button>

      <button class="text-gray-700 hover:text-black">
        <RouterLink to="/test">3D模型展示區</RouterLink> <!-- 3D模型展示區 -->
      </button>

    </div>
    <div>
      <button class="text-gray-700 hover:text-black">
        <RouterLink to="/about">聯絡我們</RouterLink>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 100
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
