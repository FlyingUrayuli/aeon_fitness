<script setup>
import { RouterView } from 'vue-router'

import NavBar from './components/NavBar.vue'
import FooterSection from './components/FooterSection.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <NavBar />
    <main class="flex-1">
      <RouterView />
    </main>
    <FooterSection />
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
