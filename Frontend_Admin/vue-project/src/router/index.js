import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import UsersView from '../views/UsersView.vue'
import ProductsView from '../views/ProductsView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import OrdersView from '../views/OrdersView.vue'

const router = createRouter({
  // Khi chạy npm run dev, base là '/' để hoạt động ở localhost:5173
  // Khi build production deploy vào /admin-ui/ thì đổi lại
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      component: AdminLayout,
      redirect: '/users',
      children: [
        { path: 'users', name: 'users', component: UsersView },
        { path: 'products', name: 'products', component: ProductsView },
        { path: 'categories', name: 'categories', component: CategoriesView },
        { path: 'orders', name: 'orders', component: OrdersView },
      ],
    },
  ],
})

export default router
