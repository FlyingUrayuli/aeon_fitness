<!-- Cart.vue -->
<template>
  <div class="min-h-screen bg-gray-100 text-gray-900">
    <!-- Fixed Progress Bar -->
    <div  v-if="!orderSummary" class="fixed top-20 left-0 right-0 z-50 bg-white shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-lg font-bold font-stzongsong">即將完成訂單...</h1>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${(currentStep / 3) * 100}%` }"
          ></div>
        </div>

        <!-- Step Labels -->
        <div class="flex justify-between mt-3 text-sm">
          <span :class="currentStep >= 1 ? 'text-blue-600 font-bold' : 'text-gray-500'">
            確認商品及數量
          </span>
          <span :class="currentStep >= 2 ? 'text-blue-600 font-bold' : 'text-gray-500'">
            確認付款資訊
          </span>
          <span :class="currentStep >= 3 ? 'text-blue-600 font-bold' : 'text-gray-500'">
            確認收件人資訊
          </span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div :class="{'pt-50': !orderSummary, 'py-8': orderSummary}" class="pb-32 container mx-auto px-4">
      <!-- FinishCart -->
      <div v-if="orderSummary" class="pt-20 max-w-4xl mx-auto space-y-6">
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="w-20 h-20 bg-transparent border-[5px] border-green-500 rounded-full flex items-center justify-center">
              <svg class="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <h1 class="text-4xl font-bold font-stzongsong text-blue-600 mb-2">恭喜完成訂單！</h1>
          <p class="text-gray-600 font-stfangsong">您的訂單已成功送出，我們將盡快為您處理。</p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold font-stzongsong mb-6 text-blue-600">收件人資訊</h2>

          <div class="mb-6">
            <h3 class="text-lg font-bold font-stzongsong mb-4">付款人資訊</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <span class="font-stfangsong font-semibold text-gray-700">姓名：</span>
                <span class="font-stfangsong">{{ orderSummary.payer.name }}</span>
              </div>
              <div>
                <span class="font-stfangsong font-semibold text-gray-700">電子郵件：</span>
                <span class="font-stfangsong">{{ orderSummary.payer.email }}</span>
              </div>
              <div>
                <span class="font-stfangsong font-semibold text-gray-700">手機：</span>
                <span class="font-stfangsong">{{ orderSummary.payer.phone }}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-bold font-stzongsong mb-4">收件人資訊</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span class="font-stfangsong font-semibold text-gray-700">姓名：</span>
                  <span class="font-stfangsong">{{ orderSummary.recipient.name }}</span>
                </div>
                <div>
                  <span class="font-stfangsong font-semibold text-gray-700">電子郵件：</span>
                  <span class="font-stfangsong">{{ orderSummary.recipient.email }}</span>
                </div>
                <div>
                  <span class="font-stfangsong font-semibold text-gray-700">手機：</span>
                  <span class="font-stfangsong">{{ orderSummary.recipient.phone }}</span>
                </div>
                <div v-if="orderSummary.recipient.taxId">
                  <span class="font-stfangsong font-semibold text-gray-700">統一編號：</span>
                  <span class="font-stfangsong">{{ orderSummary.recipient.taxId }}</span>
                </div>
              </div>
              <div>
                <span class="font-stfangsong font-semibold text-gray-700">地址：</span>
                <span class="font-stfangsong">{{ orderSummary.recipient.address }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold font-stzongsong mb-6 text-blue-600">付款資訊</h2>

          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span class="font-stfangsong font-semibold text-gray-700">付款人姓名：</span>
                <span class="font-stfangsong">{{ orderSummary.payment.name }}</span>
              </div>
              <div>
                <span class="font-stfangsong font-semibold text-gray-700">付款方式：</span>
                <span class="font-stfangsong">{{ orderSummary.payment.method === 'credit' ? '信用卡' : 'ATM轉帳' }}</span>
              </div>
            </div>

            <div v-if="orderSummary.payment.method === 'credit'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span class="font-stfangsong font-semibold text-gray-700">卡號：</span>
                <span class="font-stfangsong">**** **** **** {{ orderSummary.payment.cardNumber.slice(-4) }}</span>
              </div>
              <div>
                <span class="font-stfangsong font-semibold text-gray-700">到期日：</span>
                <span class="font-stfangsong">{{ orderSummary.payment.expiryDate }}</span>
              </div>
              <div>
                <span class="font-stfangsong font-semibold text-gray-700">驗證碼：</span>
                <span class="font-stfangsong">***</span>
              </div>
            </div>

            <div v-if="orderSummary.payment.method === 'atm'">
              <div>
                <span class="font-stfangsong font-semibold text-gray-700">銀行帳號：</span>
                <span class="font-stfangsong">{{ orderSummary.payment.bankAccount }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold font-stzongsong mb-6 text-blue-600">訂單商品</h2>

          <div v-for="(item, index) in orderSummary.items" :key="index" class="border-b pb-4 mb-4 last:border-b-0 last:mb-0">
            <div class="flex items-center gap-4">
              <img :src="item.image" :alt="item.name" class="w-20 h-20 object-cover rounded-lg">
              <div class="flex-1">
                <h3 class="font-bold font-stzongsong text-lg">{{ item.name }}</h3>
                <p class="text-gray-600 font-stfangsong">{{ item.slogan }}</p>
                <p class="text-sm text-gray-500 font-stfangsong">數量: {{ item.quantity }}</p>
              </div>
              <span class="text-lg ">NT$ {{ (item.price * item.quantity).toLocaleString() }}</span>
            </div>
          </div>

          <div class="text-right border-t pt-4 mt-4">
            <span class="text-2xl font-bold font-stzongsong">總計：NT$ {{ orderSummary.total.toLocaleString() }}</span>
          </div>
        </div>

        <div class="text-center mt-8">
          <button
            @click="goToProducts"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
          >
            繼續購物
          </button>
        </div>
      </div>
      <!-- Empty Cart State -->
      <div v-else-if="!orderSummary && cartItems.length === 0" class="text-center py-20">
        <div class="max-w-md mx-auto">
          <svg class="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 9M7 13l-1.8 9m0 0h13.6M7 13h13.6M7 13L5.4 5M7 13l-1.8 9"/>
          </svg>
          <h2 class="text-2xl font-bold font-stzongsong mb-4">您還未選購任何商品</h2>
          <button
            @click="$router.push('/products')"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            繼續選購...
          </button>
        </div>
      </div>

      <!-- Cart Content -->
      <div v-else-if="!orderSummary">
        <!-- Step 1: 確認商品及數量 -->
        <div v-show="currentStep === 1" class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 class="text-2xl font-bold font-stzongsong mb-6">確認商品及數量</h2>

          <div v-for="(item, index) in cartItems" :key="index" class="border-b pb-6 mb-6 last:border-b-0">
            <div class="flex flex-col md:flex-row gap-6">
              <!-- Product Image -->
              <div class="w-full md:w-1/4">
                <img :src="item.image" :alt="item.name" class="w-full h-48 object-cover rounded-lg">
              </div>

              <!-- Product Info -->
              <div class="flex-1">
                <h3 class="text-xl font-bold font-stzongsong mb-2">{{ item.name }}</h3>
                <p class="text-gray-600 font-stfangsong mb-4">{{ item.slogan }}</p>

                <!-- Quantity Controls -->
                <div class="flex items-center gap-4 mb-4">
                  <span class="font-stfangsong">數量：</span>
                  <button
                    @click="decreaseQuantity(index)"
                    class="cursor-pointer font-bold pb-1 bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    -
                  </button>
                  <span class="w-8 text-center font-bold">{{ item.quantity }}</span>
                  <button
                    @click="increaseQuantity(index)"
                    class="cursor-pointer font-bold pb-1 bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                <!-- Price -->
                <div class="text-right">
                  <span class="text-2xl font-bold text-blue-600">NT$ {{ (item.price * item.quantity).toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Total -->
          <div class="text-right border-t pt-4">
            <span class="text-2xl font-bold font-stzongsong">總計：NT$ {{ totalAmount.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Step 2: 確認付款資訊 -->
        <div v-show="currentStep === 2" class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 class="text-2xl font-bold font-stzongsong mb-6">確認付款資訊</h2>

          <div class="space-y-6">
            <!-- Payment Name -->
            <div>
              <label class="block font-stfangsong font-semibold mb-2">付款人姓名 *</label>
              <input
                v-model="paymentInfo.name"
                :class="['w-full px-4 py-2 border rounded-lg', paymentNameError ? 'border-red-500 animate-pulse' : 'border-gray-300']"
                placeholder="請輸入付款人姓名"
                ref="paymentNameInput"
              >
            </div>

            <!-- Payment Method -->
            <div>
              <label class="block font-stfangsong font-semibold mb-2">付款方式 *</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="paymentInfo.method"
                    type="radio"
                    value="credit"
                    class="mr-2"
                  >
                  <span class="font-stfangsong">信用卡</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="paymentInfo.method"
                    type="radio"
                    value="atm"
                    class="mr-2"
                  >
                  <span class="font-stfangsong">ATM轉帳</span>
                </label>
              </div>
            </div>

            <!-- Credit Card Info -->
            <div v-if="paymentInfo.method === 'credit'" class="space-y-4">
              <div>
                <label class="block font-stfangsong font-semibold mb-2">信用卡卡號 *</label>
                <input
                  v-model="paymentInfo.cardNumber"
                  :class="['w-full px-4 py-2 border rounded-lg', cardNumberError ? 'border-red-500 animate-pulse' : 'border-gray-300']"
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  ref="cardNumberInput"
                >
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block font-stfangsong font-semibold mb-2">到期日 *</label>
                  <input
                    v-model="paymentInfo.expiryDate"
                    :class="['w-full px-4 py-2 border rounded-lg', expiryDateError ? 'border-red-500 animate-pulse' : 'border-gray-300']"
                    placeholder="MM/YY"
                    maxlength="5"
                    ref="expiryDateInput"
                  >
                </div>
                <div>
                  <label class="block font-stfangsong font-semibold mb-2">驗證碼 *</label>
                  <input
                    v-model="paymentInfo.cvv"
                    :class="['w-full px-4 py-2 border rounded-lg', cvvError ? 'border-red-500 animate-pulse' : 'border-gray-300']"
                    placeholder="123"
                    maxlength="3"
                    ref="cvvInput"
                  >
                </div>
              </div>
            </div>

            <!-- Bank Account Info -->
            <div v-if="paymentInfo.method === 'atm'">
              <label class="block font-stfangsong font-semibold mb-2">銀行帳號 *</label>
              <input
                v-model="paymentInfo.bankAccount"
                :class="['w-full px-4 py-2 border rounded-lg', bankAccountError ? 'border-red-500 animate-pulse' : 'border-gray-300']"
                placeholder="請輸入銀行帳號"
                ref="bankAccountInput"
              >
            </div>

            <!-- Warning -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-sm font-stfangsong text-yellow-800">
                <strong>警語：</strong>請確認您的付款資訊正確無誤。完成訂單後，我們將依照您提供的資訊進行付款處理。
              </p>
            </div>
          </div>
        </div>

        <!-- Step 3: 確認收件人資訊 -->
        <div v-show="currentStep === 3" class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 class="text-2xl font-bold font-stzongsong mb-6">確認收件人資訊</h2>

          <!-- Payer Info -->
          <div class="mb-8">
            <h3 class="text-lg font-bold font-stzongsong mb-4">付款人資訊</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block font-stfangsong font-semibold mb-2">姓名 *</label>
                <input
                  v-model="payerInfo.name"
                  :class="['w-full px-4 py-2 border rounded-lg', payerNameError ? 'border-red-500 animate-pulse' : 'border-gray-300']"
                  placeholder="請輸入姓名"
                  :ref="(el) => setPayerInfoRef(el, 'payerName')"
                >
              </div>
              <div>
                <label class="block font-stfangsong font-semibold mb-2">電子郵件 *</label>
                <input
                  v-model="payerInfo.email"
                  :class="['w-full px-4 py-2 border rounded-lg', payerEmailError ? 'border-red-500 animate-pulse' : 'border-gray-300']"
                  placeholder="example@email.com"
                  type="email"
                  :ref="(el) => setPayerInfoRef(el, 'payerEmail')"
                >
              </div>
              <div>
                <label class="block font-stfangsong font-semibold mb-2">手機 *</label>
                <input
                  v-model="payerInfo.phone"
                  :class="['w-full px-4 py-2 border rounded-lg', payerPhoneError ? 'border-red-500 animate-pulse' : 'border-gray-300']"
                  placeholder="0912345678"
                  :ref="(el) => setPayerInfoRef(el, 'payerPhone')"
                >
              </div>
            </div>
          </div>

          <!-- Recipient Info -->
          <div>
            <div class="flex items-center mb-4">
              <h3 class="text-lg font-bold font-stzongsong mr-4">收件人資訊</h3>
              <label class="flex items-center">
                <input
                  v-model="sameAsPayer"
                  type="checkbox"
                  class="mr-2"
                  @change="toggleSameAsPayer"
                >
                <span class="font-stfangsong">與付款人相同</span>
              </label>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block font-stfangsong font-semibold mb-2">姓名 *</label>
                <input
                  v-model="recipientInfo.name"
                  :class="['w-full px-4 py-2 border rounded-lg', recipientNameError ? 'border-red-500 animate-pulse' : 'border-gray-300']"
                  placeholder="請輸入姓名"
                  :ref="(el) => setRecipientInfoRef(el, 'recipientName')"
                >
              </div>
              <div>
                <label class="block font-stfangsong font-semibold mb-2">電子郵件 *</label>
                <input
                  v-model="recipientInfo.email"
                  :class="['w-full px-4 py-2 border rounded-lg', recipientEmailError ? 'border-red-500 animate-pulse' : 'border-gray-300']"
                  placeholder="example@email.com"
                  type="email"
                  :ref="(el) => setRecipientInfoRef(el, 'recipientEmail')"
                >
              </div>
              <div>
                <label class="block font-stfangsong font-semibold mb-2">手機 *</label>
                <input
                  v-model="recipientInfo.phone"
                  :class="['w-full px-4 py-2 border rounded-lg', recipientPhoneError ? 'border-red-500 animate-pulse' : 'border-gray-300']"
                  placeholder="0912345678"
                  :ref="(el) => setRecipientInfoRef(el, 'recipientPhone')"
                >
              </div>
              <div>
                <label class="block font-stfangsong font-semibold mb-2">統一編號</label>
                <input
                  v-model="recipientInfo.taxId"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="12345678 (選填)"
                >
              </div>
            </div>

            <div class="mt-4">
              <label class="block font-stfangsong font-semibold mb-2">地址 *</label>
              <textarea
                v-model="recipientInfo.address"
                :class="['w-full px-4 py-2 border rounded-lg', recipientAddressError ? 'border-red-500 animate-pulse' : 'border-gray-300']"
                placeholder="請輸入完整地址"
                rows="3"
                :ref="(el) => setRecipientInfoRef(el, 'recipientAddress')"
              ></textarea>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Next Button -->
    <div v-if="!orderSummary && cartItems.length > 0" class="bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <button v-if="currentStep > 1" @click="prevStep" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors duration-300">
            上一步
          </button>
          <div v-else></div>
          <button
            @click="nextStep"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
          >
            {{ currentStep === 3 ? '完成訂單' : '下一步' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { nextTick } from 'vue'; //  用於 DOM 更新後的滾動
import { useRouter, useRoute } from 'vue-router'
import { products } from '../data/product.js'

const router = useRouter()
const route = useRoute()

// Reactive data
const orderSummary = ref(null); // 儲存訂單摘要資訊
const currentStep = ref(1)

// ➕ 新增：用於滾動到錯誤欄位的 refs
const paymentNameInput = ref(null);
const cardNumberInput = ref(null);
const expiryDateInput = ref(null);
const cvvInput = ref(null);
const bankAccountInput = ref(null);
const payerInfoInputs = ref({}); // 用於payerInfo的動態ref
const recipientInfoInputs = ref({}); // 用於recipientInfo的動態ref

// 動態設定 ref 的 helper 函數
const setPayerInfoRef = (el, fieldName) => {
  if (el) payerInfoInputs.value[fieldName] = el;
};
const setRecipientInfoRef = (el, fieldName) => {
  if (el) recipientInfoInputs.value[fieldName] = el;
};

const cartItems = ref([])
const sameAsPayer = ref(false)

// Form data
const paymentInfo = ref({
  name: '',
  method: '',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  bankAccount: ''
})

const payerInfo = ref({
  name: '',
  email: '',
  phone: ''
})

const recipientInfo = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  taxId: ''
})

// Error states
const paymentNameError = ref(false)
const cardNumberError = ref(false)
const expiryDateError = ref(false)
const cvvError = ref(false)
const bankAccountError = ref(false)
const payerNameError = ref(false)
const payerEmailError = ref(false)
const payerPhoneError = ref(false)
const recipientNameError = ref(false)
const recipientEmailError = ref(false)
const recipientPhoneError = ref(false)
const recipientAddressError = ref(false)

// Computed
const totalAmount = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

// Methods
const addToCart = (productId) => {
  const product = products.find(p => p.id === productId)
  if (product) {
    const existingItem = cartItems.value.find(item => item.id === productId)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cartItems.value.push({
        id: product.id,
        name: product.name,
        slogan: product.slogan,
        image: product.image[0],
        price: product.price,
        quantity: 1
      })
    }
  }
}

const increaseQuantity = (index) => {
  cartItems.value[index].quantity += 1
}

const decreaseQuantity = (index) => {
  if (cartItems.value[index].quantity > 1) {
    cartItems.value[index].quantity -= 1
  }
}

const toggleSameAsPayer = () => {
  if (sameAsPayer.value) {
    recipientInfo.value.name = payerInfo.value.name
    recipientInfo.value.email = payerInfo.value.email
    recipientInfo.value.phone = payerInfo.value.phone
  } else {
    recipientInfo.value.name = ''
    recipientInfo.value.email = ''
    recipientInfo.value.phone = ''
  }
}

const clearErrors = () => {
  paymentNameError.value = false
  cardNumberError.value = false
  expiryDateError.value = false
  cvvError.value = false
  bankAccountError.value = false
  payerNameError.value = false
  payerEmailError.value = false
  payerPhoneError.value = false
  recipientNameError.value = false
  recipientEmailError.value = false
  recipientPhoneError.value = false
  recipientAddressError.value = false
}

const validateStep1 = () => {
  return cartItems.value.length > 0
}

const validateStep2 = () => {
   clearErrors();
 let isValid = true;
 let firstErrorElement = null;

 const checkField = (field, errorRef, elementRef) => {
    if (!field.trim()) {
        errorRef.value = true;
        isValid = false;
        if (!firstErrorElement) {
          firstErrorElement = elementRef;
        }
    }
 };

    checkField(paymentInfo.value.name, paymentNameError, paymentNameInput.value);

 if (paymentInfo.value.method === 'credit') {
    checkField(paymentInfo.value.cardNumber, cardNumberError, cardNumberInput.value);
    checkField(paymentInfo.value.expiryDate, expiryDateError, expiryDateInput.value);
    checkField(paymentInfo.value.cvv, cvvError, cvvInput.value);
 } else if (paymentInfo.value.method === 'atm') {
    checkField(paymentInfo.value.bankAccount, bankAccountError, bankAccountInput.value);
 } else {
 // 如果沒有選擇付款方式，也算作錯誤，但沒有對應的輸入框滾動
    isValid = false;
 }

 if (!isValid && firstErrorElement) {
    nextTick(() => {
    firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
 });
 }

 return isValid;
}

const validateStep3 = () => {
  clearErrors();
  let isValid = true;
  let firstErrorElement = null;

  const checkField = (field, errorRef, inputName, isRecipient = false) => {
    if (!field.trim()) {
      errorRef.value = true;
      isValid = false;
      if (!firstErrorElement) {
        // 使用動態ref來獲取元素
        if (isRecipient) {
          firstErrorElement = recipientInfoInputs.value[inputName];
        } else {
          firstErrorElement = payerInfoInputs.value[inputName];
        }
      }
    }
  };

  // 付款人資訊
  checkField(payerInfo.value.name, payerNameError, 'payerName');
  checkField(payerInfo.value.email, payerEmailError, 'payerEmail');
  checkField(payerInfo.value.phone, payerPhoneError, 'payerPhone');

    // 收件人資訊
  checkField(recipientInfo.value.name, recipientNameError, 'recipientName', true);
  checkField(recipientInfo.value.email, recipientEmailError, 'recipientEmail', true);
  checkField(recipientInfo.value.phone, recipientPhoneError, 'recipientPhone', true);
  checkField(recipientInfo.value.address, recipientAddressError, 'recipientAddress', true);

   if (!isValid && firstErrorElement) {
    nextTick(() => {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
 }
 return isValid;
}

const nextStep = () => {
  if (currentStep.value === 1) {
    if (validateStep1()) {
      currentStep.value = 2;
      window.scrollTo({ top: 0, behavior: 'smooth' }); // 滾動到頂部
    }
  } else if (currentStep.value === 2) {
    if (validateStep2()) {
      currentStep.value = 3;
      window.scrollTo({ top: 0, behavior: 'smooth' }); // 滾動到頂部
    }
  } else if (currentStep.value === 3) {
    if (validateStep3()) {
      // Navigate to FinishCart with order data
      const orderData = {
        items: cartItems.value,
        payment: paymentInfo.value,
        payer: payerInfo.value,
        recipient: recipientInfo.value,
        total: totalAmount.value
      }

      // 設定 orderSummary 顯示訂單完成頁面
      orderSummary.value = orderData;
      // 清空購物車，模擬訂單完成並重置狀態
      cartItems.value = [];
      currentStep.value = 1; // 重置步驟條
      clearErrors(); // 清空所有錯誤狀態
      // 清空表單數據
      paymentInfo.value = { name: '', method: '', cardNumber: '', expiryDate: '', cvv: '', bankAccount: '' };
      payerInfo.value = { name: '', email: '', phone: '' };
      recipientInfo.value = { name: '', email: '', phone: '', address: '', taxId: '' };
      sameAsPayer.value = false;

      // 滾動到頁面頂部以顯示訂單完成訊息
      nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
}
// 上一步功能
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 滾動到頁面頂部
  }
};
// 跳轉回商品頁面方法
const goToProducts = () => {
  // 確保清空 orderSummary 才能回到購物車流程
  orderSummary.value = null;
  router.push('/products');
};
// Lifecycle
onMounted(() => {
  // Check if coming from ProductDetail with a product to add
  const productId = route.query.product
  if (productId) {
    addToCart(productId)
  }
  // 如果從其他頁面回來且 sessionStorage 中有訂單數據，則顯示訂單摘要
  const storedOrderData = sessionStorage.getItem('orderData');
  if (storedOrderData) {
    orderSummary.value = JSON.parse(storedOrderData);
  // 清除 sessionStorage 中的訂單數據，避免下次進入時直接顯示完成頁
    sessionStorage.removeItem('orderData');
  }

});

</script>

<style scoped>
.font-stfangsong {
  font-family: 'STFangsong', 'FangSong', serif;
}

.font-stzongsong {
  font-family: 'STZhongsong', 'SimSun', serif;
}

.animate-pulse {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
