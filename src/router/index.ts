import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import PostListView from '@/views/PostListView.vue'
import PostDetailView from '@/views/PostDetailView.vue'
import AuthView from '@/views/AuthView.vue'
import RegisterView from '@/views/RegisterView.vue'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/store/authStore'

// --- 1. DEFINICIÓN DE RUTAS ---
const routes: Array<RouteRecordRaw> = [
  // RUTAS PÚBLICAS/INVITADO
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: {
      title: 'Iniciar Sesión',
      requireAuth: false,
      isGuest: true, // Ruta accesible solo si NO está autenticado
    },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      title: 'Registro de Usuario',
      requireAuth: false,
      isGuest: true, // Ruta accesible solo si NO está autenticado
    },
  },

  // RUTAS PRIVADAS (Requieren Autenticación por defecto)
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
    meta: {
      title: 'Gestión de Productos',
      requireAuth: true, // Asegurando que 'productos' requiere autenticación
    },
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('@/views/UserAdminView.vue'),
    meta: { requireAuth: true, title: 'Gestión de Usuarios' },
  },
]
// --- 2. CREACIÓN DEL ROUTER ---
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- 3. GUARDIÁN DE NAVEGACIÓN (router.beforeEach) ---
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 1. Verificar la sesión del usuario (esto debería ser rápido)
  const isAuthenticated = await authStore.checkSession()
  const requiresAuth = to.meta.requireAuth

  // 2. Título dinámico (opcional, pero útil)
  if (to.meta.title) {
    document.title = `${to.meta.title} | CeluVariedades`
  } else {
    document.title = 'CeluVariedades'
  }

  // A. La ruta requiere autenticación (e.g., /productos, /home)
  if (requiresAuth) {
    if (isAuthenticated) {
      // ✅ Autenticado y ruta segura: Continuar
      next()
    } else {
      // ❌ No autenticado y ruta segura: Redirigir a login
      next({ name: 'auth' })
    }
    return // Salir del guardián
  }

  // B. La ruta es para invitados (e.g., /auth, /register)
  if (to.meta.isGuest) {
    if (isAuthenticated) {
      // ❌ Autenticado y ruta de invitado: Redirigir a home
      next({ name: 'home' })
    } else {
      // ✅ No autenticado y ruta de invitado: Continuar
      next()
    }
    return // Salir del guardián
  }

  // C. Cualquier otra ruta sin meta específica (Dejar pasar)
  next()
})

export default router
