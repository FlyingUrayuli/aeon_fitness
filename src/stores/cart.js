// // src/stores/cart.js
// import { defineStore } from 'pinia';

// // 定義購物車狀態管理 Store
// export const useCartStore = defineStore('cart', {
//   // state 函數返回 Store 的狀態數據
//   state: () => ({
//     items: [], // 購物車中的商品列表，每個商品包含 { product: {}, quantity: 0 }
//     payerInfo: { // 付款人資訊
//       name: '',
//       email: '',
//       phone: ''
//     },
//     recipientInfo: { // 收件人資訊
//       sameAsPayer: false, // 是否與付款人相同
//       name: '',
//       email: '',
//       phone: '',
//       address: '',
//       guiNumber: '' // 統一編號
//     },
//     lastOrder: null // 用於儲存完成的訂單資訊，供 FinishCart 頁面顯示
//   }),

//   // getters 用於從 state 派生數據，類似於計算屬性
//   getters: {
//     // 計算購物車總金額
//     cartTotal: (state) => {
//       return state.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
//     },
//     // 計算購物車商品總數量
//     cartItemCount: (state) => {
//       return state.items.reduce((count, item) => count + item.quantity, 0);
//     },
//     // 判斷購物車是否為空
//     isEmpty: (state) => state.items.length === 0,
//   },

//   // actions 用於修改 state，可以包含異步操作
//   actions: {
//     /**
//      * 將商品添加到購物車
//      * @param {Object} product - 商品對象 (例如從 data/product.js 載入的單個商品)
//      * @param {number} quantity - 添加的數量，默認為 1
//      */
//     addItem(product, quantity = 1) {
//       const existingItem = this.items.find(item => item.product.id === product.id);
//       if (existingItem) {
//         existingItem.quantity += quantity; // 如果商品已存在，則增加數量
//       } else {
//         this.items.push({ product, quantity }); // 否則，添加新商品
//       }
//     },

//     /**
//      * 更新購物車中商品的數量
//      * @param {string} productId - 商品 ID
//      * @param {number} newQuantity - 新的數量
//      */
//     updateQuantity(productId, newQuantity) {
//       const item = this.items.find(item => item.product.id === productId);
//       if (item) {
//         item.quantity = Math.max(0, newQuantity); // 確保數量不為負
//         if (item.quantity === 0) {
//           this.removeItem(productId); // 如果數量變為 0，則移除商品
//         }
//       }
//     },

//     /**
//      * 從購物車中移除商品
//      * @param {string} productId - 商品 ID
//      */
//     removeItem(productId) {
//       this.items = this.items.filter(item => item.product.id !== productId);
//     },

//     // 清空購物車和所有相關表單資訊
//     clearCart() {
//       this.items = [];
//       this.payerInfo = { name: '', email: '', phone: '' };
//       this.recipientInfo = { sameAsPayer: false, name: '', email: '', phone: '', address: '', guiNumber: '' };
//     },

//     // 保存訂單資訊到 lastOrder，並清空購物車
//     saveOrder() {
//       // 深拷貝當前購物車和表單數據，以防止後續修改影響已保存的訂單
//       this.lastOrder = {
//         items: JSON.parse(JSON.stringify(this.items)),
//         payerInfo: JSON.parse(JSON.stringify(this.payerInfo)),
//         recipientInfo: JSON.parse(JSON.stringify(this.recipientInfo)),
//         total: this.cartTotal,
//         date: new Date().toLocaleString() // 添加訂單完成時間
//       };
//       this.clearCart(); // 保存後清空購物車，準備下一次購物
//     }
//   },
// });
