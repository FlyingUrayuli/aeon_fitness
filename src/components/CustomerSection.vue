<template>
  <section
    class="fixed inset-0 flex items-center justify-center bg-black text-white text-center transition-transform duration-700 ease-out"
    :class="{ 'translate-y-0 opacity-100 z-[99]': isVisible, 'translate-y-full opacity-0 -z-10': !isVisible }"
  >
    <div class="p-8">
      <h2 class="text-4xl font-bold mb-6">[Call to Action Section Placeholder]</h2>
      <p class="text-lg mb-8">Ready to take the next step? Contact us today!</p>
      <button class="px-8 py-4 bg-white text-black rounded-lg text-lg hover:bg-gray-200 transition-colors">
        Get Started
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const isVisible = ref(false); // 控制 CTASection 的顯示與隱藏

onMounted(() => {
  ScrollTrigger.create({
    trigger: document.body, // 監聽整個頁面的捲動
    start: '90% bottom', // 當頁面底部觸及視窗底部時觸發
    // end: '+=1', // 如果你希望它只有一個觸發點，可以不用 end
    onEnter: () => {
      isVisible.value = true;
    },
    onLeaveBack: () => { // 向上捲動離開時，將 CTA 移回下方並隱藏
      isVisible.value = false;
    }
  });
});
</script>
