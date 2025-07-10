<!-- src/components/FeatureSection.vue -->
<template>
  <section
    class="relative h-[100vh] flex items-center
      justify-center text-white text-4xl z-10"
  >
    <div>{{ title }}</div>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  index: Number,
})
</script>
