<!-- src/views/FinishCart.vue -->

<!-- <script setup>
import { computed } from 'vue'; // 導入 computed
import { useRouter } from 'vue-router'; // 導入 useRouter 鉤子
import { useCartStore } from '../stores/cart'; // 導入購物車 Store

const router = useRouter(); // 獲取路由器實例
const cartStore = useCartStore(); // 獲取購物車 Store 實例

// 從 Store 中獲取最後的訂單資訊
const lastOrder = computed(() => cartStore.lastOrder);

// 導航回首頁
const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center pt-[66px] pb-20 p-4">
    <div class="bg-white p-8 rounded-lg shadow-xl max-w-3xl w-full text-center">
      <h1 class="text-4xl font-bold text-green-600 mb-6">恭喜完成訂單!</h1>

      <div v-if="lastOrder">
        <p class="text-lg text-gray-700 mb-6">您的訂單已成功送出，感謝您的購買！</p>
        <p class="text-md text-gray-500 mb-8">訂單時間: {{ lastOrder.date }}</p>

        <!-- 訂單摘要：收件人資訊 (Section 4) -->
        <div class="mb-8 border border-gray-200 p-6 rounded-lg text-left bg-gray-50">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">收件人資訊</h2>
          <p class="text-gray-700 mb-2"><strong>姓名:</strong> {{ lastOrder.recipientInfo.name }}</p>
          <p class="text-gray-700 mb-2"><strong>電子郵件:</strong> {{ lastOrder.recipientInfo.email }}</p>
          <p class="text-gray-700 mb-2"><strong>手機:</strong> {{ lastOrder.recipientInfo.phone }}</p>
          <p class="text-gray-700 mb-2"><strong>地址:</strong> {{ lastOrder.recipientInfo.address }}</p>
          <p v-if="lastOrder.recipientInfo.guiNumber" class="text-gray-700 mb-2">
            <strong>統一編號:</strong> {{ lastOrder.recipientInfo.guiNumber }}
          </p>
        </div>

        <!-- 訂單摘要：付款人資訊 (Section 3) -->
        <div class="mb-8 border border-gray-200 p-6 rounded-lg text-left bg-gray-50">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">付款人資訊</h2>
          <p class="text-gray-700 mb-2"><strong>姓名:</strong> {{ lastOrder.payerInfo.name }}</p>
          <p class="text-gray-700 mb-2"><strong>電子郵件:</strong> {{ lastOrder.payerInfo.email }}</p>
          <p class="text-gray-700 mb-2"><strong>手機:</strong> {{ lastOrder.payerInfo.phone }}</p>
          <!-- 這裡不顯示敏感的信用卡資訊 -->
        </div>

        <!-- 訂單摘要：商品清單 (Section 2) -->
        <div class="mb-8 border border-gray-200 p-6 rounded-lg text-left bg-gray-50">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">訂購商品</h2>
          <div v-for="item in lastOrder.items" :key="item.product.id" class="flex items-center py-2 border-b border-gray-100 last:border-b-0">
            <img :src="item.product.images[0]" alt="Product Image" class="w-16 h-16 object-cover rounded-md mr-4" />
            <div class="flex-1">
              <p class="text-lg font-medium text-gray-900">{{ item.product.name }}</p>
              <p class="text-sm text-gray-600">數量: {{ item.quantity }}</p>
            </div>
            <p class="text-lg font-semibold text-gray-900">NT$ {{ (item.product.price * item.quantity).toLocaleString() }}</p>
          </div>
          <div class="text-right mt-4 pt-4 border-t border-gray-200">
            <p class="text-2xl font-bold text-gray-900">總金額: NT$ {{ lastOrder.total.toLocaleString() }}</p>
          </div>
        </div>

        <button
          @click="goToHome"
          class="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg"
        >
          返回首頁
        </button>
      </div>
      <div v-else class="text-center py-20">
        <p class="text-2xl font-semibold text-gray-700 mb-4">沒有找到訂單資訊。</p>
        <button
          @click="goToHome"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
        >
          返回首頁
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 這裡可以放置 FinishCart.vue 特有的樣式 */
</style> -->
