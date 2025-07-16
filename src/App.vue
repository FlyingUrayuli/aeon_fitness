<!-- app.vue -->
<script setup>
import { RouterView, useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, provide } from 'vue'

import NavBar from './components/NavBar.vue'
import FooterSection from './components/FooterSection.vue'
import LoadingAnimation from './components/LoadingAnimation.vue'

const isLoading = ref(true)
const router = useRouter()

// ✅ 提供給下層使用
const setLoading = (value = true) => {
  isLoading.value = value
  if (!value) {
    document.body.classList.add('loaded')
  } else {
    document.body.classList.remove('loaded')
  }
}
provide('loadingControl', {
  isLoading,
  setLoading
})

// 初次載入：背景圖載入 + 至少顯示 1.5 秒
onMounted(() => {
  const loadImagePromise = new Promise(resolve => {
    const img = new Image()
    img.src = '@/assets/video_AZ50_ver11.glb?url'
    img.onload = resolve
    img.onerror = resolve
  })
  const minDisplayTime = new Promise(resolve => setTimeout(resolve, 1500))

  Promise.all([loadImagePromise, minDisplayTime]).then(() => {
    setLoading(false)
  })
})

// 路由跳轉也控制 loading 顯示
router.beforeEach((to, from, next) => {
  setLoading(true)
  next()
})
router.afterEach(() => {
  setTimeout(() => setLoading(false), 1000)
})

onUnmounted(() => {
  document.body.classList.remove('loaded')
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <LoadingAnimation v-if="isLoading" />
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
