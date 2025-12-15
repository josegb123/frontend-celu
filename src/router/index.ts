import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/authStore'

import AuthView from '@/views/AuthView.vue'
import HomeView from '@/views/HomeView.vue'
import VentaPOS from '@/views/VentaPOS.vue'
import DevolucionFormView from '@/views/devoluciones/DevolucionFormView.vue'
import DevolucionGestionView from '@/views/devoluciones/DevolucionGestionView.vue'
import ReportesAdminView from '@/views/ReportesAdminView.vue'

// --------------------
// 1. DEFINICIÓN DE RUTAS
// --------------------
const routes: Array<RouteRecordRaw> = [
  // 🔓 LOGIN (única ruta pública)
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: {
      title: 'Iniciar Sesión',
      isGuest: true,
    },
  },

  // --------------------
  // RUTAS PRIVADAS
  // --------------------
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Inicio',
      requireAuth: true,
      roles: ['admin', 'seller'],
    },
  },
  {
    path: '/pos',
    name: 'pos',
    component: VentaPOS,
    meta: {
      title: 'Venta POS',
      requireAuth: true,
      roles: ['admin', 'seller'],
      layout: 'LayoutPOS',
    },
  },
  {
    path: '/ventas',
    name: 'ventas',
    component: () => import('@/views/VentaAdminView.vue'),
    meta: {
      title: 'Ventas',
      requireAuth: true,
      roles: ['admin', 'seller'],
    },
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: () => import('@/views/ClientesAdminView.vue'),
    meta: {
      title: 'Clientes',
      requireAuth: true,
      roles: ['admin', 'seller'],
    },
  },
  {
    path: '/devoluciones/registrar',
    name: 'DevolucionForm',
    component: DevolucionFormView,
    meta: {
      title: 'Registrar Devolución',
      requireAuth: true,
      roles: ['admin', 'seller'],
    },
  },
  {
    path: '/devoluciones/gestion',
    name: 'DevolucionGestion',
    component: DevolucionGestionView,
    meta: {
      title: 'Gestión de Devoluciones',
      requireAuth: true,
      roles: ['admin', 'seller'],
    },
  },

  // --------------------
  // 🔐 SOLO ADMIN
  // --------------------
  {
    path: '/productos',
    name: 'Productos',
    component: () => import('@/views/ProductAdminView.vue'),
    meta: {
      title: 'Productos',
      requireAuth: true,
      roles: ['admin', 'seller'],
    },
  },
  {
    path: '/proveedores',
    name: 'Proveedores',
    component: () => import('@/views/ProveedoresView.vue'),
    meta: {
      title: 'Proveedores',
      requireAuth: true,
      roles: ['admin'],
    },
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('@/views/UserAdminView.vue'),
    meta: {
      title: 'Usuarios',
      requireAuth: true,
      roles: ['admin'],
    },
  },
  {
    path: '/movimientos',
    name: 'movimientos',
    component: () => import('@/views/MovimientosView.vue'),
    meta: {
      title: 'Movimientos Financieros',
      requireAuth: true,
      roles: ['admin'],
    },
  },
  {
    path: '/recibir-pedidos',
    name: 'RecibirPedidos',
    component: () => import('@/views/RecibirPedidosView.vue'),
    meta: {
      title: 'Recibir Pedidos',
      requireAuth: true,
      roles: ['admin'],
    },
  },
  {
    path: '/notificaciones',
    name: 'notificaciones',
    component: () => import('@/views/NotificacionesView.vue'),
    meta: {
      title: 'Notificaciones',
      requireAuth: true,
      roles: ['admin', 'seller'],
    },
  },
  {
    path: '/cuentas-por-cobrar',
    name: 'cuentas',
    component: () => import('@/views/CuentasPorCobrarView.vue'),
    meta: {
      title: 'Cuentas por Cobrar',
      requireAuth: true,
      roles: ['admin', 'seller'],
    },
  },
  {
    path: '/admin/reportes',
    name: 'AdminReports',
    component: ReportesAdminView,
    meta: {
      title: 'Reportes',
      requireAuth: true,
      roles: ['admin'],
    },
  },
]

// --------------------
// 2. CREACIÓN DEL ROUTER
// --------------------
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --------------------
// 3. GUARDIÁN GLOBAL
// --------------------
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = await authStore.checkSession()
  const userRole = authStore.user?.role

  // Título
  document.title = to.meta.title
    ? `${to.meta.title} : ${import.meta.env.VITE_BRANDING_NAME}`
    : import.meta.env.VITE_BRANDING_NAME

  // 🔓 Ruta pública (auth)
  if (to.meta.isGuest) {
    return isAuthenticated ? next({ name: 'home' }) : next()
  }

  // 🔐 Ruta protegida
  if (to.meta.requireAuth) {
    if (!isAuthenticated) {
      return next({ name: 'auth' })
    }
    if (to.meta.roles && userRole && !((to.meta.roles as string[]) || []).includes(userRole)) {
      return next({ name: 'auth' }) // o 'forbidden' si usas 403
    }
  }

  next()
})

export default router
