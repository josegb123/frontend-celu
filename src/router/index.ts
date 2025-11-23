import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import PostListView from '@/views/PostListView.vue'
import PostDetailView from '@/views/PostDetailView.vue'
import AuthView from '@/views/AuthView.vue'
import RegisterView from '@/views/RegisterView.vue'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/store/authStore'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: {
      title: 'Iniciar Sesión',
      requireAuth: false,
      isGuest: true,
    },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      requireAuth: false,
      isGuest: true,
    },
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Pantalla de bienvenida',
      requireAuth: true,
    },
  },
  {
    path: '/post',
    name: 'PostList',
    component: PostListView,
    meta: {
      title: 'Listado de Posts',
      requireAuth: true,
    },
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetailView,
    meta: {
      title: 'Detalle del Post',
      requireAuth: true,
    },
  },
  {
    path: '/ventas/nueva',
    name: 'VentaNueva',
    component: () => import('@/views/VentaForm.vue'),
    meta: {
      requireAuth: true,
      title: 'Nueva Venta',
    },
  },
  {
    path: '/productos',
    name: 'Productos',
    component: () => import('@/views/ProductAdminView.vue'),
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  const isAuthenticated = await authStore.checkSession()

  if (to.meta.requireAuth) {
    if (isAuthenticated) {
      next()
    } else {
      next({ name: 'auth' })
    }
  } else if (to.meta.isGuest) {
    if (isAuthenticated) {
      next({ name: 'home' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
