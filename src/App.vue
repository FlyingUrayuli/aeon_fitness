<!-- app.vue -->
<script setup>
import { RouterView, useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

import NavBar from './components/NavBar.vue'
import FooterSection from './components/FooterSection.vue'
import LoadingAnimation from './components/LoadingAnimation.vue'

const isLoading = ref(true)
const router = useRouter()

// 初次載入：背景圖載入 + 至少顯示 1.5 秒
onMounted(() => {
  const loadImagePromise = new Promise(resolve => {
    const img = new Image()
    img.src = '@/assets/video_AZ50_ver11.glb?url' // 這是假設你的背景是圖片路徑，或可替換為真圖
    img.onload = resolve
    img.onerror = resolve
  })

  const minDisplayTime = new Promise(resolve => setTimeout(resolve, 1500))

  Promise.all([loadImagePromise, minDisplayTime]).then(() => {
    isLoading.value = false
    document.body.classList.add('loaded')
  })
})

// 每次路由變化都觸發 loading
router.beforeEach((to, from, next) => {
  isLoading.value = true
  next()
})

router.afterEach(() => {
  setTimeout(() => {
    isLoading.value = false
    document.body.classList.add('loaded')
  }, 1000) // 讓動畫至少顯示 1 秒
})

onUnmounted(() => {
  document.body.classList.remove('loaded')
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- 條件性地顯示載入動畫 -->
    <LoadingAnimation v-if="isLoading" />
    <!-- 當 isLoading 為 false 時，顯示您的主要應用內容 -->
    <template v-if="!isLoading">
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
