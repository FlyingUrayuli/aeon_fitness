<!-- videoscroll.vue -->
<template>
  <div
    ref="videoContainerRef"
    class="fixed top-0 left-0 w-full h-screen pointer-events-none"
    style="z-index: 0; background-color: #FFFFFF; visibility: hidden;"
    >
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
})

const videoRef = ref(null)
const videoContainerRef = ref(null)
let currentScrollTrigger = null
let hasVideoMetadataLoaded = false;
let isVideoReadyForScrub = false;

onMounted(() => {
  watch([videoRef, () => props.triggerId], async ([newVideoEl, newTriggerId]) => {
    await nextTick();

    const video = newVideoEl;
    const triggerEl = document.getElementById(newTriggerId);

    if (!video || !triggerEl || !triggerEl.getBoundingClientRect) {
      console.warn(`[VideoScroll] 無效的 videoRef 或 triggerEl (${newTriggerId})，無法設定 ScrollTrigger。Source: ${props.videoSrc}`);
      if (currentScrollTrigger) {
        currentScrollTrigger.kill();
        currentScrollTrigger = null;
      }
      return;
    }

    if (currentScrollTrigger) {
      currentScrollTrigger.kill();
      currentScrollTrigger = null;
    }

    console.log(`[VideoScroll] Setting up for video: ${props.videoSrc} with triggerId: ${newTriggerId}`);

    if (video.src !== window.location.origin + props.videoSrc) {
      video.src = props.videoSrc;
      hasVideoMetadataLoaded = false;
      isVideoReadyForScrub = false;
    }

    video.load();

    gsap.set(videoContainerRef.value, { visibility: 'hidden' });
    gsap.set(video, { autoAlpha: 0 });
    video.pause();
    video.currentTime = 0;


    const setupScrollTriggerAndVideo = () => {
      if (hasVideoMetadataLoaded) return;

      hasVideoMetadataLoaded = true;
      console.log(`[VideoScroll] Video metadata loaded for: ${props.videoSrc}. Checking readyState...`);

      // 只有當影片緩衝到 READY_STATE_HAVE_FUTURE_DATA (3) 或以上時，才視為準備好進行 scrubbing
      if (video.readyState >= 3) {
        isVideoReadyForScrub = true;
        console.log(`[VideoScroll] Video ${props.videoSrc} is ready for scrubbing (readyState >= 3).`);
      } else {
        const onCanPlayThrough = () => {
            isVideoReadyForScrub = true;
            console.log(`[VideoScroll] Video ${props.videoSrc} is canplaythrough now, ready for scrubbing.`);
            video.removeEventListener('canplaythrough', onCanPlayThrough);
        };
        video.addEventListener('canplaythrough', onCanPlayThrough);
      }

      video.currentTime = 0;
      video.pause();

      currentScrollTrigger = ScrollTrigger.create({
        trigger: triggerEl,
        start: 'top top',
        end: 'bottom top', // 這裡維持 'bottom top' 以便測試
        scrub: true,
        // markers: true,
        onUpdate: (self) => {
          if (isVideoReadyForScrub) {
            const frame = Math.round(self.progress * (props.totalFrames - 1));
            const time = frame / props.fps;

            if (Math.abs(video.currentTime - time) > 0.001) {
                video.currentTime = time;
            }

            if (self.isActive) {
                gsap.set(videoContainerRef.value, { visibility: 'visible' });
                gsap.to(video, { autoAlpha: 1, duration: 0.01 });
            } else {
                gsap.to(video, { autoAlpha: 0, duration: 0.01 });
                gsap.delayedCall(0.02, () => {
                    if (!self.isActive) {
                        gsap.set(videoContainerRef.value, { visibility: 'hidden' });
                    }
                });
                if (!video.paused) {
                    video.pause();
                }
                if (video.currentTime !== 0) {
                    video.currentTime = 0;
                }
            }
          } else {
             gsap.set(videoContainerRef.value, { visibility: 'hidden' });
             gsap.set(video, { autoAlpha: 0 });
          }
        },
        onStop: () => {
            if (video.readyState >= 2 && !video.paused) {
                video.pause();
                console.log(`[VideoScroll] Video ${props.videoSrc} paused on scroll stop.`);
            }
        },
        onEnter: () => console.log(`[VideoScroll] Entering trigger area for: ${props.videoSrc}`),
        onLeave: () => console.log(`[VideoScroll] Leaving trigger area (down) for: ${props.videoSrc}`),
        onEnterBack: () => console.log(`[VideoScroll] Entering trigger area (up) for: ${props.videoSrc}`),
        onLeaveBack: () => console.log(`[VideoScroll] Leaving trigger area (up) for: ${props.videoSrc}`),
      });
      video.removeEventListener('loadedmetadata', setupScrollTriggerAndVideo);
    };

    if (video.readyState >= 1) {
      setupScrollTriggerAndVideo();
    } else {
      video.addEventListener('loadedmetadata', setupScrollTriggerAndVideo, { once: true });
      video.addEventListener('error', (e) => {
        console.error(`[VideoScroll] 影片加載錯誤 (${props.videoSrc}):`, e);
      }, { once: true });
    }
  }, { immediate: true });
});

onUnmounted(() => {
  if (currentScrollTrigger) {
    currentScrollTrigger.kill();
    currentScrollTrigger = null;
  }
  const video = videoRef.value;
  if (video) {
    video.pause();
    video.removeAttribute('src');
    video.load();
    console.log(`[VideoScroll] Cleaned up ${props.videoSrc}`);
  }
  hasVideoMetadataLoaded = false;
  isVideoReadyForScrub = false;
});
</script>
