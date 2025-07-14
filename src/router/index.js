import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Test3D from '../views/Test3D.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/products',       // 產品列表頁
      name: 'products',
      component: () => import('../views/ProductList.vue'),
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: ProductDetail,
      props: true,

    },
    {
      path: '/test',
      name: 'test',
      // component: Test3D,
      // props: true,
      component: () => import('../views/Test3D.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/Cart.vue'),
    },
    
  ],
  scrollBehavior() {
    return { top:0 };
  }
})

export default router
