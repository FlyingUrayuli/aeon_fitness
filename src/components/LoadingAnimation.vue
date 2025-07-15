<template>
  <div class="loading-screen">
    <div class="logo-container">
      <div class="logo-grid">
        <!-- 第一行 -->
        <div class="cell cell-1-1" data-cell-id="c11"></div>
        <div class="cell cell-1-2" data-cell-id="c12"></div>
        <div class="cell cell-1-3" data-cell-id="c13"></div>
        <div class="cell cell-1-4" data-cell-id="c14"></div>
        <!-- 第二行 -->
        <div class="cell cell-2-1" data-cell-id="c21"></div>
        <div class="cell cell-2-2" data-cell-id="c22"></div>
        <div class="cell cell-2-3" data-cell-id="c23"></div>
        <div class="cell cell-2-4" data-cell-id="c24"></div>
        <!-- 第三行 -->
        <div class="cell cell-3-1" data-cell-id="c31"></div>
        <div class="cell cell-3-2" data-cell-id="c32"></div>
        <div class="cell cell-3-3" data-cell-id="c33"></div>
        <div class="cell cell-3-4" data-cell-id="c34"></div>
      </div>
      <div class="logo-text">AEON FITNESS</div>
      <!-- 新增載入百分比顯示 -->
      <div class="loading-percentage">{{ loadingProgress }}%</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// 用於控制載入進度的響應式變數
const loadingProgress = ref(0);
let intervalId = null; // 用於儲存 setInterval 的 ID，以便清除

onMounted(() => {
  // 模擬載入進度，每 25 毫秒增加 1%
  intervalId = setInterval(() => {
    if (loadingProgress.value < 100) {
      loadingProgress.value++;
    } else {
      clearInterval(intervalId); // 達到 100% 時清除定時器
    }
  }, 25); // 25ms * 100 = 2.5 秒完成載入
});

// 組件卸載時清除定時器，防止記憶體洩漏
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
/* 引入 Inter 字體，確保文字顯示效果 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

/* 全螢幕黑色背景的載入畫面容器 */
.loading-screen {
  position: fixed; /* 固定定位，覆蓋整個視窗 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: black; /* 全黑背景 */
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  z-index: 9999; /* 確保其在所有內容之上 */
  font-family: 'Inter', sans-serif; /* 使用 Inter 字體 */
}

.logo-container {
  display: flex;
  flex-direction: column; /* 垂直排列 Logo 和文字 */
  align-items: center; /* 水平居中對齊子元素 */
  /* 新增懸停發光效果的過渡 */
  transition: box-shadow 0.3s ease-in-out;
}

/* Logo 懸停時的發光效果 */
.logo-container:hover {
  box-shadow: 0 0 40px rgba(239, 68, 68, 0.7); /* 紅色發光，半透明 */
  border-radius: 10px; /* 輕微圓角，使發光更自然 */
}

.logo-grid {
  display: grid;
  grid-template-columns: repeat(4, 30px); /* 4 列，每列 30px 寬 */
  grid-template-rows: repeat(3, 30px);    /* 3 行，每行 30px 高 */
  gap: 0; /* 方格之間沒有間隙 */
  width: 120px; /* 總寬度 4 * 30px */
  height: 90px;  /* 總高度 3 * 30px */
}

.cell {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: transparent; /* 預設為透明 */
  box-sizing: border-box; /* 包含內邊距和邊框在元素的總寬高內 */
  overflow: hidden; /* 確保圓角和三角形在邊界內 */
}

/* 定義所有活躍方塊的基礎動畫：發光並淡出 */
@keyframes glow-and-fade {
  0% { background-color: #ef4444; } /* red-500 */
  /* 更正點 1: 將發光顏色改為半透明 */
  10% { background-color: rgba(252, 165, 165, 0.3); } /* red-300 的半透明版本，模擬發光 */
  20% { background-color: #ef4444; } /* red-500 */
  100% { background-color: #ef4444; } /* 恢復正常顏色 */
}

/* 填滿的方塊 - 應用基礎樣式和動畫 */
.cell-1-2, .cell-1-3, .cell-2-1, .cell-2-4, .cell-3-2, .cell-3-4 {
  background-color: #ef4444; /* red-500 */
  animation: glow-and-fade 2.5s infinite; /* 應用動畫，持續 2.5 秒，無限循環 */
}

/* 特殊形狀的方塊及其動畫 */

/* 方格 1,1: 右上角的紅色三角形 */
.cell-1-1::before {
  content: '';
  position: absolute;
  inset: 0; /* 覆蓋整個父元素 */
  background-color: #ef4444; /* red-500 */
  /* 使用 clip-path 創建右上角三角形 */
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%);
  animation: glow-and-fade 2.5s infinite;
}

/* 方格 1,4: 右上角圓弧 50% */
.cell-1-4 {
  background-color: #ef4444; /* red-500 */
  border-top-right-radius: 50%; /* 50% 圓角，使其在方格內呈現半圓 */
  animation: glow-and-fade 2.5s infinite;
}

/* 方格 3,1: 左下角圓弧 50% */
.cell-3-1 {
  background-color: #ef4444; /* red-500 */
  border-bottom-left-radius: 50%; /* 50% 圓角，使其在方格內呈現半圓 */
  animation: glow-and-fade 2.5s infinite;
}

/* 方格 3,3: 左邊一半紅色 */
.cell-3-3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 50%; /* 寬度為父元素的一半 */
  height: 100%; /* 高度為父元素的全部 */
  background-color: #ef4444; /* red-500 */
  animation: glow-and-fade 2.5s infinite;
}

/* 動畫延遲，創建貪食蛇效果 */
/* 動畫順序：c11 -> c12 -> c13 -> c14 -> c24 -> c34 -> c33 -> c32 -> c31 -> c21 */
/* 共有 10 個活躍方塊 */
/* 總動畫時長：2.5 秒 */
/* 每一步的時長：2.5 秒 / 10 = 0.25 秒 */

.cell-1-1::before { animation-delay: calc(0 * 0.25s); }
.cell-1-2 { animation-delay: calc(1 * 0.25s); }
.cell-1-3 { animation-delay: calc(2 * 0.25s); }
.cell-1-4 { animation-delay: calc(3 * 0.25s); }
.cell-2-4 { animation-delay: calc(4 * 0.25s); }
.cell-3-4 { animation-delay: calc(5 * 0.25s); } /* 新增的 c34 延遲 */
.cell-3-3::before { animation-delay: calc(6 * 0.25s); }
.cell-3-2 { animation-delay: calc(7 * 0.25s); }
.cell-3-1 { animation-delay: calc(8 * 0.25s); }
.cell-2-1 { animation-delay: calc(9 * 0.25s); }


/* Logo 下方的文字樣式 */
.logo-text {
  color: white; /* 白色文字 */
  font-size: 1.25rem; /* 大小為 text-xl */
  font-weight: 700; /* 粗體字 */
  margin-top: 1rem; /* 與上方 Logo 間距 1rem */
  font-family: 'Inter', sans-serif; /* 使用 Inter 字體 */
  width: max-content; /* 寬度適應內容 */
  max-width: 120px; /* 最大寬度不超過 Logo 方格的總寬度 */
  text-align: center; /* 文字居中 */
  white-space: nowrap; /* 確保文字不換行 */
}

/* 新增載入百分比的樣式 */
.loading-percentage {
  color: white; /* 白色文字 */
  font-size: 1rem; /* 字體大小 */
  margin-top: 0.5rem; /* 與上方文字的間距 */
  font-family: 'Inter', sans-serif; /* 使用 Inter 字體 */
}
</style>
