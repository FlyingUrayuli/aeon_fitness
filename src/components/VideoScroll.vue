<!-- videoscroll.vue -->
<template>
  <div
    ref="videoContainerRef"
    class="fixed top-0 left-0 w-full h-screen pointer-events-none"
    style="z-index: 1; opacity: 0;" >
    <video
      ref="videoRef"
      class="w-full h-full object-cover"
      muted
      playsinline
      preload="auto"
      crossorigin="anonymous"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  videoSrc: String,
  totalFrames: Number,
  fps: Number,
  triggerId: String,
  isFirstVideo: Boolean, // 新增：從 HeroSection 接收此 prop
})

const videoRef = ref(null)
const videoContainerRef = ref(null)
let currentScrollTrigger = null
let hasVideoMetadataLoaded = false;
let isVideoReadyForScrub = false;

onMounted(() => {
  watch([videoRef, () => props.triggerId], async ([newVideoEl, newTriggerId]) => {
    await nextTick(); // 確保 DOM 渲染完成

    const video = newVideoEl;
    const triggerEl = document.getElementById(newTriggerId);

    // 檢查必要的 DOM 元素是否存在，否則無法設定 ScrollTrigger
    if (!video || !triggerEl || !triggerEl.getBoundingClientRect) {
      console.warn(`[VideoScroll] 無效的 videoRef 或 triggerEl (${newTriggerId})，無法設定 ScrollTrigger。Source: ${props.videoSrc}`);
      if (currentScrollTrigger) {
        currentScrollTrigger.kill(); // 清理舊的 ScrollTrigger 實例
        currentScrollTrigger = null;
      }
      return;
    }

    // 清理舊的 ScrollTrigger 實例，避免重複或衝突
    if (currentScrollTrigger) {
      currentScrollTrigger.kill();
      currentScrollTrigger = null;
    }

    console.log(`[VideoScroll] Setting up for video: ${props.videoSrc} with triggerId: ${newTriggerId}`);

    // 如果影片源不同於當前設置，則更新 src 並重置相關狀態
    if (video.src !== window.location.origin + props.videoSrc) {
      video.src = props.videoSrc;
      hasVideoMetadataLoaded = false;
      isVideoReadyForScrub = false;
    }

    video.load(); // 觸發影片加載

    // 初始化影片容器為完全透明，並確保影片暫停且時間為 0
    // 這裡用 autoAlpha 統一控制 opacity 和 visibility，比單獨用 visibility: hidden 更平滑且彈性
    gsap.set(videoContainerRef.value, { autoAlpha: 0 });
    // gsap.set(video, { autoAlpha: 0 }); // 這一行可以移除，因為 autoAlpha 會在父元素上控制整體可見性
    video.pause();
    video.currentTime = 0;


    // 設定 ScrollTrigger 和影片播放的核心邏輯
    const setupScrollTriggerAndVideo = () => {
      if (hasVideoMetadataLoaded) return; // 避免重複執行

      hasVideoMetadataLoaded = true;
      console.log(`[VideoScroll] Video metadata loaded for: ${props.videoSrc}. Checking readyState...`);

      // 檢查影片是否已緩衝到足夠的數據 (HAVE_FUTURE_DATA 或更高) 以供流暢 scrubbing
      if (video.readyState >= 3) {
        isVideoReadyForScrub = true;
        console.log(`[VideoScroll] Video ${props.videoSrc} is ready for scrubbing (readyState >= 3).`);
      } else {
        // 如果還沒準備好，監聽 'canplaythrough' 事件，確保影片可流暢播放
        const onCanPlayThrough = () => {
            isVideoReadyForScrub = true;
            console.log(`[VideoScroll] Video ${props.videoSrc} is canplaythrough now, ready for scrubbing.`);
            video.removeEventListener('canplaythrough', onCanPlayThrough);
        };
        video.addEventListener('canplaythrough', onCanPlayThrough);
      }

      // --- 關鍵邏輯：處理第一個影片的特殊顯示，使其在滾動前可見 ---
      if (props.isFirstVideo && isVideoReadyForScrub) {
        video.currentTime = 0; // 確保顯示第0幀
        video.pause(); // 確保影片保持暫停狀態
        gsap.to(videoContainerRef.value, { autoAlpha: 1, duration: 0.01 }); // 影片容器極速淡入顯示
        console.log(`[VideoScroll] First video (${props.videoSrc}) immediately displayed at frame 0.`);
      } else {
        // 對於非第一個影片，或第一個影片還未準備好時，影片容器保持完全隱藏
        gsap.set(videoContainerRef.value, { autoAlpha: 0 });
        video.currentTime = 0;
        video.pause();
      }

      // 創建 ScrollTrigger 實例來控制影片播放
      currentScrollTrigger = ScrollTrigger.create({
        trigger: triggerEl,
        start: 'top top',    // 當觸發器頂部碰到視窗頂部時開始
        end: 'bottom top',   // 當觸發器底部碰到視窗頂部時結束
        scrub: true,         // 啟用滾動同步動畫
        // markers: true,     // 開發模式下顯示標記，方便調試

        onUpdate: (self) => {
          if (isVideoReadyForScrub) { // 只有影片準備好時才更新 currentTime
            const frame = Math.round(self.progress * (props.totalFrames - 1));
            const time = frame / props.fps;

            // 避免過於頻繁的 currentTime 設置，減少性能開銷
            if (Math.abs(video.currentTime - time) > 0.001) {
                video.currentTime = time;
            }

            if (self.isActive) {
                // 當 ScrollTrigger 活躍時，影片容器極速淡入
                gsap.to(videoContainerRef.value, { autoAlpha: 1, duration: 0.01 });
            } else {
                // 當 ScrollTrigger 不活躍時，影片容器極速淡出
                gsap.to(videoContainerRef.value, { autoAlpha: 0, duration: 0.01 });
                // 這裡移除了 gsap.delayedCall，因為 autoAlpha 處理 visibility 更直接和高效
                // 離開活躍區間時，暫停影片並將時間歸零
                if (!video.paused) {
                    video.pause();
                }
                if (video.currentTime !== 0) {
                    video.currentTime = 0;
                }
            }
          } else {
             // 如果影片還未準備好，始終保持容器透明 (避免顯示不完整的畫面)
             gsap.set(videoContainerRef.value, { autoAlpha: 0 });
             // gsap.set(video, { autoAlpha: 0 }); // 這一行可以移除
          }
        },
        onStop: () => { // 滾動停止時暫停影片（額外優化，避免背景持續播放）
            if (video.readyState >= 2 && !video.paused) {
                video.pause();
                console.log(`[VideoScroll] Video ${props.videoSrc} paused on scroll stop.`);
            }
        },
        // 日誌用於開發調試
        onEnter: () => console.log(`[VideoScroll] Entering trigger area for: ${props.videoSrc}`),
        onLeave: () => console.log(`[VideoScroll] Leaving trigger area (down) for: ${props.videoSrc}`),
        onEnterBack: () => console.log(`[VideoScroll] Entering trigger area (up) for: ${props.videoSrc}`),
        onLeaveBack: () => console.log(`[VideoScroll] Leaving trigger area (up) for: ${props.videoSrc}`),
      });
      // 移除 loadedmetadata 監聽器，避免重複設定 ScrollTrigger
      video.removeEventListener('loadedmetadata', setupScrollTriggerAndVideo);
    };

    // 判斷影片元數據是否已加載，決定是立即設置還是等待事件
    if (video.readyState >= 1) { // HTMLMediaElement.HAVE_METADATA (元數據已加載)
      setupScrollTriggerAndVideo();
    } else {
      video.addEventListener('loadedmetadata', setupScrollTriggerAndVideo, { once: true }); // 只監聽一次
      video.addEventListener('error', (e) => {
        console.error(`[VideoScroll] 影片加載錯誤 (${props.videoSrc}):`, e);
      }, { once: true }); // 監聽加載錯誤
    }
  }, { immediate: true }); // immediate: true 確保在組件掛載時立即執行一次 watch
});

onUnmounted(() => {
  // 組件卸載時清理所有相關資源，避免內存洩漏和不必要的行為
  if (currentScrollTrigger) {
    currentScrollTrigger.kill(); // 銷毀 ScrollTrigger 實例
    currentScrollTrigger = null;
  }
  const video = videoRef.value;
  if (video) {
    video.pause(); // 暫停影片
    video.removeAttribute('src'); // 移除 src 屬性以釋放影片資源
    video.load(); // 強制重新加載以確保 src 被清除
    console.log(`[VideoScroll] Cleaned up ${props.videoSrc}`);
  }
  hasVideoMetadataLoaded = false;
  isVideoReadyForScrub = false;
});
</script>
