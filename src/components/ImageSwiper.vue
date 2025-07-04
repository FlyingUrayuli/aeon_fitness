<template>
  <div
    :class="[containerWidth || '', 'mx-auto relative overflow-hidden']"
    :style="{ maxWidth: containerWidthStyle }"
  >
    <div
      ref="cardContainer"
      class="relative h-[500px] flex justify-center items-center"
      style="perspective: 1000px;"
    >
      <div
        v-for="(item, i) in props.items"
        :key="i + item" :data-index="i" class="card-item absolute rounded-xl overflow-hidden shadow-lg
          w-[300px] sm:w-[280px] md:w-[350px]
          h-[420px] sm:h-[380px] md:h-[420px]"
        :style="{
          // 初始樣式：讓元素在 JS 控制前不顯示，避免 FOUC
          transform: `translateX(0%) scale(0)`, // 初始縮小隱藏
          opacity: 0,
          zIndex: 0,
          filter: 'none',
          pointerEvents: 'none'
        }"
      >
        <img :src="item" class="w-full h-full object-cover" />
      </div>
    </div>

    <button @click="prev"
      class="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30
        text-white text-4xl rounded px-3 py-1 z-20 cursor-pointer select-none">‹</button>
    <button @click="next"
      class="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30
        text-white text-4xl rounded px-3 py-1 z-20 cursor-pointer select-none">›</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import { wrap } from 'gsap/gsap-core'; // 確保正確引入 wrap

const props = defineProps({
  items: { type: Array, required: true },
  visibleCount: { type: Number, default: 7 },
  translateOffset: { type: Number, default: 80 },
  containerWidth: { type: String, default: '' }
})

const centerIndex = ref(0)
const cardContainer = ref(null)

const total = computed(() => props.items.length)
const visualHalf = computed(() => Math.floor(props.visibleCount / 2));

const containerWidthStyle = computed(() => {
  const cardWidthNum = 350; // md:w-[350px]
  const offsetPerCard = props.translateOffset;

  // 計算輪播的最大寬度，確保所有可見卡片都能在範圍內
  let calculatedWidth = cardWidthNum + (offsetPerCard * (props.visibleCount -1)); // 考慮 visibleCount 的卡片寬度加上間距
  calculatedWidth += 200; // 額外增加一些緩衝空間，確保兩側有足夠的空間讓卡片進出
  return `${calculatedWidth}px`;
});

// 這個函數計算的是卡片相對於中心卡片的邏輯偏移量 (0, 1, 2, ..., -1, -2, ...)
function getOffset(i) {
  let offset = i - centerIndex.value;
  // 將 offset 範圍包裹到 -total/2 到 total/2 之間
  // 這確保了無論實際索引如何，我們總能得到一個「最近」的相對距離
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
  nextTick(() => {
    if (!cardContainer.value || !cardContainer.value.children) {
      return;
    }

    // 將 DOM 元素按 data-index 排序，確保處理順序與邏輯順序一致
    const currentCardElements = Array.from(cardContainer.value.children)
      .filter(el => el instanceof HTMLElement)
      .sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));

    // 如果 DOM 元素數量與數據總數不符，可能還在 Vue 更新中，等待下一次 nextTick
    if (currentCardElements.length !== total.value) {
        return;
    }

    currentCardElements.forEach((el) => {
      const originalIndex = parseInt(el.dataset.index);
      const offset = getOffset(originalIndex); // 獲取已包裹的視覺偏移量

      // 計算目標的 xPercent 值
      let targetXPercent = offset * props.translateOffset;

      // 根據 offset 判斷其他動畫屬性
      let targetOpacity = 1;
      let targetPointerEvents = 'auto';
      let targetScale = 1;
      let targetZIndex = 100 - Math.abs(offset);
      let targetFilter = 'none';

      let isHidden = false;

      // 判斷卡片是否應該完全隱藏（超出可見範圍）
      // 這部分邏輯保持不變，因為它基於視覺距離
      if (Math.abs(offset) > visualHalf.value) {
        isHidden = true;
      }

      // 處理圖片數量少於 visibleCount 的情況，隱藏多餘的「佔位」卡片
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
      } else {
        targetScale = 1 - Math.abs(offset) * 0.15;
        if (Math.abs(offset) === visualHalf.value) {
          targetFilter = 'blur(2px)';
        } else {
            targetFilter = 'none';
        }
      }

      // 計算 GSAP wrap 的精確範圍
      // 這個範圍需要覆蓋所有卡片從最左到最右可能的 xPercent 變動
      // 考慮到 translateOffset 是百分比位移，總位移範圍應該是 total * translateOffset
      const wrapRange = total.value * props.translateOffset;
      const wrapMin = -wrapRange / 2;
      const wrapMax = wrapRange / 2 + (total.value % 2 === 0 ? 0 : props.translateOffset / 2);
      // 對於偶數個項目，wrapMax 應恰好在中間的某一點；對於奇數，則需額外偏移半個單位

      gsap.to(el, {
        xPercent: targetXPercent,
        opacity: targetOpacity,
        pointerEvents: targetPointerEvents,
        scale: targetScale,
        zIndex: targetZIndex,
        filter: targetFilter,
        duration: 0.4,
        ease: 'power2.out',
        // 使用 GSAP 的 `modifiers` 來實現 wrap
        modifiers: {
          // wrap 函數確保當 xPercent 超出範圍時，它會從另一邊「循環」回來
          xPercent: wrap(wrapMin, wrapMax)
        },
        overwrite: true
      });
    });
  });
}

function next() {
  centerIndex.value = (centerIndex.value + 1) % total.value;
}

function prev() {
  centerIndex.value = (centerIndex.value - 1 + total.value) % total.value;
}

onMounted(() => {
  applyAnimationsToCards();
});

watch(centerIndex, applyAnimationsToCards);

// 當 items 數據源改變時，重置 centerIndex 並更新動畫
watch(() => props.items, (newItems, oldItems) => {
  const itemsChanged = !oldItems || newItems.length !== oldItems.length || JSON.stringify(newItems) !== JSON.stringify(oldItems);

  if (itemsChanged) {
    centerIndex.value = 0;
  }
  nextTick(applyAnimationsToCards);
}, { immediate: true, deep: true });
</script>
