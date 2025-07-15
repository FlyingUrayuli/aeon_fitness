<!-- app.vue -->
<script setup>
import { RouterView } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'; // 導入 ref 和 onMounted

import NavBar from './components/NavBar.vue'
import FooterSection from './components/FooterSection.vue'
import LoadingAnimation from './components/LoadingAnimation.vue'; // LoadingAnimation 組件

// 控制載入動畫顯示狀態的響應式變數
const isLoading = ref(true);

// 您的背景圖片 URL
const backgroundImageURL = '@/assets/video_AZ50_ver11.glb?url'; // <-- **請將此替換為您實際的背景圖片路徑**

onMounted(() => {
  // 1. 創建一個 Promise 來等待背景圖片載入完成
  const loadImagePromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.src = backgroundImageURL;
    img.onload = () => {
      console.log('背景圖片載入完成！');
      resolve(); // 圖片載入成功
    };
    img.onerror = (error) => {
      console.error('背景圖片載入失敗:', error);
      // 即使載入失敗，我們也希望載入動畫最終能隱藏
      resolve(); // 仍然 resolve，讓動畫可以結束
    };
  });

  // 2. 創建一個 Promise 來確保載入動畫至少顯示一段時間 (例如 1.5 秒)
  const minDisplayTimePromise = new Promise(resolve => {
    setTimeout(() => {
      console.log('載入動畫最短顯示時間已過。');
      resolve();
    }, 1500); // 至少顯示 1.5 秒
  });

  // 3. 使用 Promise.all 等待所有條件都滿足後再隱藏載入動畫
  Promise.all([loadImagePromise, minDisplayTimePromise])
    .then(() => {
      console.log('所有載入條件滿足，隱藏載入動畫。');
      isLoading.value = false; // 所有條件滿足後隱藏動畫
      // 在載入完成後，為 body 添加 'loaded' 類名，以啟用滾動條
      document.body.classList.add('loaded');
    })
    .catch(error => {
      console.error('載入過程中發生錯誤:', error);
      // 即使有錯誤，也確保載入動畫最終會隱藏
      isLoading.value = false;
      document.body.classList.add('loaded');
    });
});

// 組件卸載時，確保移除 body 上的 'loaded' 類名
onUnmounted(() => {
  document.body.classList.remove('loaded');
});

</script>
<template>
  <div class="flex flex-col min-h-screen">
    <!-- 條件性地顯示載入動畫 -->
    <LoadingAnimation v-if="isLoading" />
    <!-- 當 isLoading 為 false 時，顯示您的主要應用內容 -->
    <template v-else>
      <div class="flex flex-col min-h-screen">
        <NavBar />
        <main class="flex-1">
          <RouterView />
        </main>
        <FooterSection />
      </div>
    </template>
</div>
</template>

<style>
/* 隱藏所有頁面的捲軸，但仍允許滾動 */
html, body {
  scrollbar-width: none;             /* Firefox */
  -ms-overflow-style: none;          /* IE 10+ */
  overflow-y: scroll;                /* 保留滾動功能 */
}

html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;                     /* Chrome / Safari / Edge */
}


</style>
