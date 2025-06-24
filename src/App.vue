<script setup>
import { RouterLink, RouterView } from 'vue-router'

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
