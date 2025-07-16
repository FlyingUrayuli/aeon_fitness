<!-- ctasection.vue -->
<template>
  <section class="bg-black/90 py-20 text-white z-20 px-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">

      <!-- 左欄：圖片 -->
      <div class="flex justify-center">
        <img
          src="/AEON-跑步機/GT500/GT500-02.png"
          alt="聯絡我們"
          class="object-contain max-w-full max-h-[500px] w-full liquid-glass"
        />
      </div>

      <!-- 右欄：標題 + 表單 -->
      <div class="space-y-6">
        <!-- 標題 -->
        <h2 class="text-3xl md:text-4xl font-bold mb-4">請填寫聯繫資訊</h2>

        <!-- 表單 -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <input
            v-model="form.name"
            type="text"
            placeholder="姓名"
            class="w-full px-6 py-4 rounded-lg bg-white/10 text-white placeholder-white placeholder:text-lg text-lg focus:outline-none focus:ring-2 focus:ring-white"
            required
          />
          <input
            v-model="form.email"
            type="email"
            placeholder="Email"
            class="w-full px-6 py-4 rounded-lg bg-white/10 text-white placeholder-white placeholder:text-lg text-lg focus:outline-none focus:ring-2 focus:ring-white"
            required
          />
          <textarea
            v-model="form.message"
            placeholder="留言內容..."
            rows="5"
            class="w-full px-6 py-4 rounded-lg bg-white/10 text-white placeholder-white placeholder:text-lg text-lg focus:outline-none focus:ring-2 focus:ring-white"
            required
          ></textarea>
          <button
            type="submit"
            class="w-full px-6 py-4 bg-white text-black rounded-lg text-base font-semibold hover:bg-gray-200 transition"
          >
            送出
          </button>
        </form>
      </div>

    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  name: '',
  email: '',
  message: ''
})

const handleSubmit = () => {
  console.log('送出內容：', form)
  alert('已送出，感謝您的聯繫！')
  form.name = ''
  form.email = ''
  form.message = ''
}
</script>
