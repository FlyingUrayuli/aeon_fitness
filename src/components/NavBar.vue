<!-- NavBar.vue -->
<template>
  <nav class="fixed liquid-glass top-0 w-full z-50 py-4 px-6 flex justify-between items-center">
    <RouterLink to="/">
      <img class="w-12 h-12" src="/aeon_logo.png" alt="logo">
    </RouterLink>
    <div class="hidden md:flex gap-6">
      <button class="glass-clear px-6 py-2">
        <RouterLink to="/products">產品</RouterLink>
      </button>
      <button class="glass-clear px-6 py-2">
        <RouterLink to="/cart">購物車</RouterLink>
      </button>
      <!-- <button class="glass-clear glass-clear:hover px-6 py-2">
        <RouterLink to="/test">3D模型展示區</RouterLink>
      </button> -->
    </div>

    <div>
      <button @click="scrollToFooter" class="glass-clear px-6 py-2">
        聯絡我們
      </button>
    </div>
  </nav>
</template>

<script setup>
// 1. 導入 gsap 和 ScrollToPlugin
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// 2. 註冊插件 (這一步非常重要，且只需在專案中執行一次)
//    您可以將它放在 App.vue 或 main.js，但放在這裡也同樣有效。
gsap.registerPlugin(ScrollToPlugin);

const scrollToFooter = () => {
  const footerElement = document.getElementById('page-footer-cta');

  if (footerElement) {
    // 3. 使用 GSAP 進行滾動動畫
    gsap.to(window, {
      duration: 2, // 【控制速度】滾動時間為 2 秒，數字越大越慢
      scrollTo: "#page-footer-cta", // 滾動到指定的 ID 元素
      ease: 'power2.inOut' // 使用平滑的緩動效果，讓體驗更佳
    });
  } else {
    console.warn('當前頁面找不到 ID 為 "page-footer-cta" 的區塊。');
  }
};
</script>
