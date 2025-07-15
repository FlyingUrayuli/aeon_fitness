<!-- NavBar.vue -->
<template>
  <nav class="fixed liquid-glass top-0 w-full z-50 py-4 px-6 flex justify-between items-center">
    <RouterLink to="/">
      <img src="/logo.svg" alt="Logo" />
    </RouterLink>
    <div class="hidden md:flex gap-6">
      <button class="glass-clear glass-clear:hover px-6 py-2">
        <RouterLink to="/products">產品</RouterLink> <!-- 產品列表 -->
      </button>
      <button class="glass-clear glass-clear:hover px-6 py-2">
        <RouterLink to="/cart">購物車</RouterLink>
      </button>

      <button class="glass-clear glass-clear:hover px-6 py-2">
        <RouterLink to="/test">3D模型展示區</RouterLink> <!-- 3D模型展示區 -->
      </button>

    </div>
    <div>
      <button class="glass-clear glass-clear:hover px-6 py-2">
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
