<template>
  <div :class="[containerWidth || '', 'mx-auto relative overflow-hidden']" :style="{ maxWidth: containerWidthStyle }"
    @mouseenter="stopAutoplay" @mouseleave="startAutoplay">
    <div ref="cardContainer" class="relative h-[500px] flex justify-center items-center" style="perspective: 1000px;">

      <div v-for="(item, i) in props.items"
        :key="i + item"
        :data-index="i"
        :ref="el => { if (el) cardRefs[i] = el }"
        class="card-item absolute
          w-[300px] sm:w-[280px] md:w-[350px]
          h-[420px] sm:h-[380px] md:h-[420px]
          rounded-2xl overflow-hidden
          bg-white/20 dark:bg-white/10
          backdrop-blur-md
          border border-white/20 dark:border-white/10
          shadow-xl
          ring-1 ring-white/10 hover:ring-2 hover:ring-white/30
          transition duration-500 ease-out"
          :style="{
            transform: `translateX(0%) scale(0)`,
            opacity: 0,
            zIndex: 0,
            filter: 'none',
            pointerEvents: 'none'
            }" @mousemove="handleTilt($event, i)" @mouseleave="resetTilt(i)">
        <img :src="item"
          class="w-full h-full object-cover filter contrast-110 brightness-95 transition duration-500 ease-out" />

    </div>
  </div>

  <button @click="handlePrev" class="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30
        text-white text-4xl rounded px-3 py-1 z-20 cursor-pointer select-none">‹</button>
  <button @click="handleNext" class="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30
        text-white text-4xl rounded px-3 py-1 z-20 cursor-pointer select-none">›</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { wrap } from 'gsap/gsap-core';

const props = defineProps({
  items: { type: Array, required: true },
  visibleCount: { type: Number, default: 7 },
  translateOffset: { type: Number, default: 80 },
  containerWidth: { type: String, default: '' },
  autoplay: { type: Boolean, default: false },
  autoplayInterval: { type: Number, default: 3000 }
});

const centerIndex = ref(0);
const cardContainer = ref(null);
const cardRefs = ref([]);
const autoplayTimer = ref(null);
const isAnimating = ref(false);

const total = computed(() => props.items.length);
const visualHalf = computed(() => Math.floor(props.visibleCount / 2));

const containerWidthStyle = computed(() => {
  const cardWidthNum = 350;
  const offsetPerCard = props.translateOffset;

  let calculatedWidth = cardWidthNum + (offsetPerCard * (props.visibleCount - 1));
  calculatedWidth += 200;
  return `${calculatedWidth}px`;
});

function handleTilt(event, index) {
  const el = cardRefs[index];
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const midX = rect.width / 2;
  const midY = rect.height / 2;

  const rotateX = ((y - midY) / midY) * -10;
  const rotateY = ((x - midX) / midX) * 10;

  el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
}

function resetTilt(index) {
  const el = cardRefs[index];
  if (el) {
    el.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
  }
}


function getOffset(i) {
  let offset = i - centerIndex.value;
  if (total.value > 0) {
    if (offset > total.value / 2) {
      offset -= total.value;
    } else if (offset < -total.value / 2) {
      offset += total.value;
    }
  }
  return offset;
}

function applyAnimationsToCards() {
  if (isAnimating.value) return;
  isAnimating.value = true;

  nextTick(() => {
    if (!cardRefs.value || cardRefs.value.length === 0 || cardRefs.value.length !== total.value) {
      isAnimating.value = false;
      return;
    }

    const totalMovementRange = total.value * props.translateOffset;
    const wrapMin = -(totalMovementRange / 2);
    const wrapMax = (totalMovementRange / 2) + (total.value % 2 !== 0 ? props.translateOffset / 2 : 0);

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.value = false;
      }
    });

    cardRefs.value.forEach((el, originalIndex) => {
      if (!el) return;

      const offset = getOffset(originalIndex);

      let targetXPercent = offset * props.translateOffset;

      let targetOpacity = 1;
      let targetPointerEvents = 'auto';
      let targetScale = 1;

      // *** 關鍵修改點：調整 z-index 的遞減幅度 ***
      // 讓其從 100 開始，但遞減得更快，例如乘以一個係數
      // 這裡使用 100 - (Math.abs(offset) * 5) 作為範例，您可以調整 '5' 這個係數
      // 目的是確保當 offset 變大時，z-index 快速下降
      let targetZIndex = 100 - (Math.abs(offset) * 5);
      // 確保 z-index 不會變成負值，至少為 1 (除非隱藏)
      if (targetZIndex < 1 && !isHidden) {
        targetZIndex = 1;
      }

      let targetFilter = 'none';

      let isHidden = false;

      if (Math.abs(offset) > visualHalf.value) {
        isHidden = true;
      }

      if (total.value < props.visibleCount) {
        const activeItemRange = Math.floor(total.value / 2);
        if (Math.abs(offset) > activeItemRange && total.value > 0) {
          isHidden = true;
        }
      }

      if (isHidden) {
        targetOpacity = 0;
        targetPointerEvents = 'none';
        targetScale = 0;
        targetZIndex = 0; // 隱藏時 z-index 直接設為 0
      } else {
        targetScale = 1 - Math.abs(offset) * 0.15;
        if (Math.abs(offset) === visualHalf.value) {
          targetFilter = 'blur(2px)';
        } else {
          targetFilter = 'none';
        }
      }

      tl.to(el, {
        xPercent: targetXPercent,
        opacity: targetOpacity,
        pointerEvents: targetPointerEvents,
        scale: targetScale,
        zIndex: targetZIndex,
        filter: targetFilter,
        duration: 0.4,
        ease: 'power2.out',
        modifiers: {
          xPercent: wrap(wrapMin, wrapMax)
        },
        overwrite: true
      }, 0);
    });
  });
}

function handleNext() {
  if (isAnimating.value) return;
  stopAutoplay();
  next();
}

function handlePrev() {
  if (isAnimating.value) return;
  stopAutoplay();
  prev();
}

function next() {
  centerIndex.value = (centerIndex.value + 1) % total.value;
}

function prev() {
  centerIndex.value = (centerIndex.value - 1 + total.value) % total.value;
}

// --- 自動播放相關函數 ---
function startAutoplay() {
  if (props.autoplay && !autoplayTimer.value && total.value > 1) {
    autoplayTimer.value = setInterval(() => {
      if (!isAnimating.value) {
        next();
      }
    }, props.autoplayInterval);
  }
}

function stopAutoplay() {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value);
    autoplayTimer.value = null;
  }
}

// --- 生命周期鉤子 ---
onMounted(() => {
  nextTick(() => {
    if (cardRefs.value.length === total.value) {
      cardRefs.value.forEach((el, originalIndex) => {
        if (!el) return;
        const offset = getOffset(originalIndex);

        let targetXPercent = offset * props.translateOffset;
        let targetScale = 1 - Math.abs(offset) * 0.15;
        // *** 關鍵修改點：onMounted 時的 z-index 也調整遞減幅度 ***
        let targetZIndex = 100 - (Math.abs(offset) * 5);
        if (targetZIndex < 1 && !isHidden) {
          targetZIndex = 1;
        }

        let targetOpacity = 1;
        let targetPointerEvents = 'auto';
        let targetFilter = 'none';

        let isHidden = false;
        if (Math.abs(offset) > visualHalf.value) {
          isHidden = true;
        }
        if (total.value < props.visibleCount) {
          const activeItemRange = Math.floor(total.value / 2);
          if (Math.abs(offset) > activeItemRange && total.value > 0) {
            isHidden = true;
          }
        }

        if (isHidden) {
          targetOpacity = 0;
          targetPointerEvents = 'none';
          targetScale = 0;
          targetZIndex = 0;
        } else if (Math.abs(offset) === visualHalf.value) {
          targetFilter = 'blur(2px)';
        }

        gsap.set(el, {
          xPercent: targetXPercent,
          opacity: targetOpacity,
          pointerEvents: targetPointerEvents,
          scale: targetScale,
          zIndex: targetZIndex,
          filter: targetFilter
        });
      });
      startAutoplay();
    }
  });
});

onUnmounted(() => {
  stopAutoplay();
});

watch(centerIndex, applyAnimationsToCards);

watch(() => props.items, (newItems, oldItems) => {
  const itemsChanged = !oldItems || newItems.length !== oldItems.length || JSON.stringify(newItems) !== JSON.stringify(oldItems);

  if (itemsChanged) {
    centerIndex.value = 0;
    cardRefs.value = [];
    stopAutoplay();
    nextTick(() => {
      applyAnimationsToCards();
      startAutoplay();
    });
  }
}, { immediate: true, deep: true });

watch(() => props.autoplay, (newVal) => {
  if (newVal) {
    startAutoplay();
  } else {
    stopAutoplay();
  }
});
</script>

<style scoped>
/* 這裡可以放組件特有的樣式 */
</style>
