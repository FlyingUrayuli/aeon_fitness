<template>
  <div
    ref="videoContainerEl"
    class="fixed top-0 left-0 w-full h-screen z-0"
  >
    <video
      ref="videoEl"
      class="w-full h-full object-cover"
      :src="videoSrc"
      muted
      playsinline
    ></video>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const props = defineProps({
  totalFeatureSectionsHeight: { // 接收從 Home.vue 傳來的 FeatureSection 總高度
    type: Number,
    default: 0
  }
});

const videoEl = ref(null);
const videoContainerEl = ref(null);
const videoSrc = '/video/home_video-v3.mp4';
const totalFrames = 700; // 影片總幀數
const fps = 30;         // 影片幀率
// const duration = totalFrames / fps; // 影片總時長 (秒) - 在這個方案中不再直接用於計算滾動距離

let videoPlaybackST = null;
let videoPositionST = null;

const initScrollTriggers = () => {
  const video = videoEl.value;
  const container = videoContainerEl.value;

  if (!video || !container || props.totalFeatureSectionsHeight === 0) {
    // 條件檢查，確保組件準備就緒
    return;
  }

  if (video.readyState < 2) {
    video.onloadedmetadata = () => {
      initScrollTriggers(); // 影片元數據載入後重新嘗試初始化
    };
    return;
  }

  // 銷毀舊的 ScrollTrigger 實例，防止重複創建
  if (videoPlaybackST) videoPlaybackST.kill();
  if (videoPositionST) videoPositionST.kill();

  let scroll = { frame: 0 };

  // --- 1. 影片播放進度同步滾動 ---
  // 最關鍵的改變：影片播放的結束點**直接等於 FeatureSection 的總高度**。
  // 這會使得影片的播放速度根據 FeatureSection 的實際長度自動調整。
  // 如果 FeatureSection 較短，影片播放會加速；如果較長，則會減速。
  const videoPlaybackEndScroll = props.totalFeatureSectionsHeight;

  videoPlaybackST = gsap.to(scroll, {
    frame: totalFrames - 1, // 目標是播放到影片最後一幀
    ease: 'none', // 均勻播放
    scrollTrigger: {
      trigger: 'body', // 綁定到整個頁面的滾動
      start: 'top top', // 從頁面頂部開始
      end: `+=${videoPlaybackEndScroll}`, // 影片播放結束的滾動距離
      scrub: true, // 將動畫進度綁定到滾動進度
      //markers: { startColor: "green", endColor: "purple", indent: 50 }, // 調試標記
      onUpdate: () => {
        const time = scroll.frame / fps;
        if (video.currentTime !== time) {
          video.currentTime = time;
        }
      }
    }
  });

  // --- 2. 影片固定/解除固定行為 ---
  // 這個邏輯保持不變，影片只在 FeatureSection 的滾動範圍內固定
  videoPositionST = ScrollTrigger.create({
    trigger: 'body', // 綁定到整個頁面的滾動
    start: 'top top', // 從頁面頂部開始固定
    end: `+=${props.totalFeatureSectionsHeight}`, // 在 FeatureSection 總高度處解除固定
    // markers: { startColor: "blue", endColor: "red", indent: 100 }, // 調試標記

    onUpdate: (self) => {
      if (self.progress >= 0 && self.progress < 1) {
        // 在 FeatureSection 範圍內，影片固定
        gsap.set(container, { position: 'fixed', top: 0, clearProps: 'transform' });
      } else if (self.progress >= 1) {
        // 超出 FeatureSection 範圍，影片絕對定位，跟隨內容滾動
        const finalTopPosition = props.totalFeatureSectionsHeight;
        gsap.set(container, { position: 'absolute', top: finalTopPosition + 'px', clearProps: 'transform' });
      } else {
        // 滾動回頂部之前，保持固定
        gsap.set(container, { position: 'fixed', top: 0, clearProps: 'transform' });
      }
    },
  });

  // 確保初始狀態是 fixed
  gsap.set(container, { position: 'fixed', top: 0 });
  // 刷新 ScrollTrigger，確保計算正確
  ScrollTrigger.refresh();
};

onMounted(() => {
  // 監聽 totalFeatureSectionsHeight prop 的變化，確保在值可用時初始化
  watch(() => props.totalFeatureSectionsHeight, (newVal) => {
    if (newVal > 0) {
      initScrollTriggers();
    }
  }, { immediate: true }); // immediate: true 確保在組件掛載時立即運行一次

  // 處理影片元數據載入的時機
  // 如果影片已經載入完成 (readyState >= 2)，則直接初始化
  // 否則，等待 onloadedmetadata 事件觸發
  if (videoEl.value && videoEl.value.readyState < 2) {
    videoEl.value.onloadedmetadata = () => {
      initScrollTriggers();
    };
  } else {
    initScrollTriggers();
  }
});

onUnmounted(() => {
  // 組件卸載時，銷毀 ScrollTrigger 實例，防止記憶體洩漏
  if (videoPlaybackST) videoPlaybackST.kill();
  if (videoPositionST) videoPositionST.kill();
  ScrollTrigger.getAll().forEach(st => st.kill());
});
</script>
