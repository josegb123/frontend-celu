import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AuthView from '@/views/AuthView.vue'
import RegisterView from '@/views/RegisterView.vue'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/store/authStore'
import VentaPOS from '@/views/VentaPOS.vue'
import DevolucionFormView from '@/views/devoluciones/DevolucionFormView.vue' // Import
import DevolucionGestionView from '@/views/devoluciones/DevolucionGestionView.vue' // Import
import ReportesAdminView from '@/views/ReportesAdminView.vue' // New Import

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
    path: '/cuentas-por-cobrar',
    name: 'cuentas',
    component: () => import('@/views/CuentasPorCobrarView.vue'),
    meta: {
      title: 'Cuentas por cobrar',
      requireAuth: true,
    },
  },
  {
    path: '/pos',
    name: 'pos',
    component: VentaPOS,
    meta: { requiresAuth: true, layout: 'LayoutPOS', title: 'Venta Nueva - POS' },
  },
  {
    path: '/productos',
    name: 'Productos',
    component: () => import('@/views/ProductAdminView.vue'),
    meta: {
      title: 'Gestión de Productos',
      requireAuth: true,
    },
  },
  {
    path: '/proveedores',
    name: 'Proveedores',
    component: () => import('@/views/ProveedoresView.vue'),
    meta: {
      title: 'Gestión de Proveedores',
      requireAuth: true,
    },
  },
  {
    path: '/ventas',
    name: 'ventas',
    component: () => import('@/views/VentaAdminView.vue'),
    meta: {
      title: 'Gestión de Ventas',
      requireAuth: true, // Asegurando que 'ventas' requiere autenticación
    },
  },
  {
    path: '/recibir-pedidos',
    name: 'RecibirPedidos',
    component: () => import('@/views/RecibirPedidosView.vue'),
    meta: {
      title: 'Recibir Pedidos de Proveedor',
      requireAuth: true,
    },
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('@/views/UserAdminView.vue'),
    meta: { requireAuth: true, title: 'Gestión de Usuarios' },
  },
  {
    path: '/movimientos',
    name: 'movimientos',
    component: () => import('@/views/MovimientosView.vue'),
    meta: {
      title: 'Movimientos Financieros',
      requireAuth: true, // Asegurando que 'movimientos' requiere autenticación
    },
  },
  {
    path: '/notificaciones',
    name: 'notificaciones',
    component: () => import('@/views/NotificacionesView.vue'),
    meta: {
      title: 'Notificaciones',
      requireAuth: true,
    },
  },
  {
    path: '/devoluciones/registrar',
    name: 'DevolucionForm',
    component: DevolucionFormView,
    meta: {
      title: 'Registrar Devolución',
      requireAuth: true,
    },
  },
  {
    path: '/devoluciones/gestion',
    name: 'DevolucionGestion',
    component: DevolucionGestionView,
    meta: {
      title: 'Gestión de Devoluciones',
      requireAuth: true,
    },
  },
  {
    path: '/admin/reportes', // Nueva ruta para reportes
    name: 'AdminReports',
    component: ReportesAdminView,
    meta: {
      title: 'Reportes y Estadísticas',
      requireAuth: true,
    },
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
