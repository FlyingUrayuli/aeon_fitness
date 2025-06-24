<template>
  <div class="min-h-screen px-6 py-20 text-center">
    <h1 class="text-4xl font-bold mb-4">產品詳情：{{ id.toUpperCase() }}</h1>
    <p class="text-gray-600">此為展示頁面，可根據產品 ID 撈取後端資料。</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id
</script>
