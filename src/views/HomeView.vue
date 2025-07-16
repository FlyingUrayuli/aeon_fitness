<!-- src/views/HomeView.vue -->
<template>
  <div>
    <!-- HeroSection 將被這個 HomeView 的 ScrollTrigger 固定 -->
    <HeroSection ref="heroSectionComponentRef" />

    <!-- <CustomerSection /> -->

    <!-- CTASection 將在 Hero Section 滾動完成後顯示 -->
    <CTASection id="page-footer-cta" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HeroSection from '../components/HeroSection.vue'
import CustomerSection from '../components/CustomerSection.vue'
import CTASection from '../components/CTASection.vue'

import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

// 從新創建的檔案導入 features 陣列
import { features } from '../data/product.js'; // <--- 這裡的路徑已更新

gsap.registerPlugin(ScrollTrigger);

const heroSectionComponentRef = ref(null); // 引用 HeroSection 組件實例
let mainHeroPinTrigger = null;


onMounted(() => {
  const setupScrollTrigger = () => {
    // 檢查 heroSectionComponentRef 和其內部暴露的 heroSectionEl 是否已存在
    if (heroSectionComponentRef.value && heroSectionComponentRef.value.heroSectionEl) {
      const heroEl = heroSectionComponentRef.value.heroSectionEl;
      // 計算 HeroAnimation 內部滾動的總高度
      const totalInternalScrollHeight = (features.length + 1) * window.innerHeight;

      mainHeroPinTrigger = ScrollTrigger.create({
        trigger: heroEl,
        start: 'top top', // 當 heroEl 的頂部到達視窗頂部時開始固定
        pin: true,        // 固定 heroEl
        end: `+=${totalInternalScrollHeight}`, // 固定距離等於 HeroAnimation 的總內部滾動高度
        // scrub: true, // 如果你想讓外部滾動也影響這個 pinning 動畫，可以開啟
        // markers: true, // 開啟 markers 幫助調試
        onEnter: () => {
          console.log("HeroSection pinned.");
        },
        onLeave: () => {
          console.log("HeroSection unpinned (scrolling down).");
        },
        onEnterBack: () => {
          console.log("HeroSection re-pinned (scrolling up).");
        },
        onLeaveBack: () => {
          console.log("HeroSection unpinned (scrolling up to top).");
        }
      });
    } else {
      // 如果 ref 還沒準備好，稍後再嘗試
      requestAnimationFrame(setupScrollTrigger);
    }
  };

  setupScrollTrigger();
});

onBeforeUnmount(() => {
  if (mainHeroPinTrigger) {
    mainHeroPinTrigger.kill(); // 清理 ScrollTrigger 實例
  }
});
</script>
