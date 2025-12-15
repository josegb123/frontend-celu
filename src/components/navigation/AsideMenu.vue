<template>
  <aside
    v-if="isAuthenticated"
    :class="['app-sidebar', { collapsed: layoutStore.isSidebarCollapsed }]"
  >
    <div class="sidebar-header d-flex align-items-center p-3">
      <button
        class="btn btn-icon text-white"
        @click="layoutStore.toggleSidebar"
        aria-label="Toggle sidebar"
      >
        <i class="bi" :class="layoutStore.isSidebarCollapsed ? 'bi-list' : 'bi-arrow-bar-left'"></i>
      </button>

      <router-link
        v-if="!layoutStore.isSidebarCollapsed"
        :to="{ name: 'home' }"
        class="navbar-brand fw-bold fs-6 text-uppercase text-white ms-3 truncate-text"
      >
        <span class="branding-wrap">{{ nameBranding }}</span>
      </router-link>
    </div>

    <nav class="sidebar-nav-content p-2 flex-grow-1">
      <div v-for="section in visibleMenu" :key="section.title" class="menu-section">
        <p v-if="!layoutStore.isSidebarCollapsed" class="menu-title text-white-50 px-3 py-1 mb-1">
          {{ section.title }}
        </p>

        <ul class="nav flex-column">
          <li v-for="item in section.items" :key="item.name" class="nav-item">
            <router-link
              :to="{ name: item.name }"
              class="nav-link text-white"
              exact-active-class="router-link-exact-active"
            >
              <i :class="['bi', item.icon, 'me-2']"></i>
              <span v-if="!layoutStore.isSidebarCollapsed">
                {{ item.label }}
              </span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <div
      class="sidebar-footer d-flex align-items-center justify-content-between p-2 border-top border-secondary"
    >
      <div class="d-flex align-items-center">
        <UserProfileMenu @show-cierre-modal="emit('showCierreModal')" />
        <span v-if="!layoutStore.isSidebarCollapsed" class="ms-2 text-white truncate-text">
          {{ authStore.user?.name || 'Usuario' }}
        </span>
      </div>

      <button
        @click="themeStore.toggleDarkMode"
        class="btn btn-sm"
        :class="themeStore.isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'"
        title="Cambiar Tema"
      >
        <i class="bi" :class="themeStore.isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'"></i>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/authStore'
import { useLayoutStore } from '@/store/layoutStore'
import { useThemeStore } from '@/store/themeStore'
import UserProfileMenu from '@/components/users/UserProfileMenu.vue'

// =========================
// DEFINICIONES Y EMITS
// =========================
const emit = defineEmits(['showCierreModal'])

const authStore = useAuthStore()
const layoutStore = useLayoutStore()
const themeStore = useThemeStore()

const { isAuthenticated } = storeToRefs(authStore)

const nameBranding = import.meta.env.VITE_BRANDING_NAME

// Corrección TS: Asegura que userRole siempre sea un string (o 'guest' por defecto)
const userRole = computed((): string => authStore.user?.role || 'guest')

// =========================
// MENÚ DECLARATIVO POR ROLES
// =========================
const menu = [
  {
    title: 'Operaciones',
    roles: ['admin', 'seller'],
    items: [
      { name: 'home', label: 'Inicio', icon: 'bi-house' },
      { name: 'pos', label: 'Punto de Venta', icon: 'bi-cart' },
      { name: 'ventas', label: 'Historial Ventas', icon: 'bi-receipt' },
      { name: 'notificaciones', label: 'Notificaciones', icon: 'bi-bell' },
    ],
  },
  {
    title: 'Inventario & Compras',
    roles: ['admin', 'seller'],
    items: [
      { name: 'Productos', label: 'Productos', icon: 'bi-box' },
      {
        name: 'DevolucionGestion',
        label: 'Devoluciones',
        icon: 'bi-arrow-counterclockwise',
        roles: ['admin'],
      },
      { name: 'Proveedores', label: 'Proveedores', icon: 'bi-truck', roles: ['admin'] },
      {
        name: 'RecibirPedidos',
        label: 'Recibir Pedidos',
        icon: 'bi-truck-flatbed',
        roles: ['admin'],
      },
    ],
  },
  {
    title: 'Finanzas',
    roles: ['admin', 'seller'],
    items: [
      { name: 'Clientes', label: 'Clientes', icon: 'bi-person' },
      { name: 'cuentas', label: 'Cuentas por Cobrar', icon: 'bi-wallet2' },
      {
        name: 'movimientos',
        label: 'Movimientos Financieros',
        icon: 'bi-journal-text',
        roles: ['admin'],
      },
    ],
  },
  {
    title: 'Administración',
    roles: ['admin'],
    items: [
      { name: 'Usuarios', label: 'Usuarios', icon: 'bi-people' },
      { name: 'AdminReports', label: 'Reportes y Estadísticas', icon: 'bi-graph-up' },
    ],
  },
]

// =========================
// FILTRADO FINAL POR ROL
// =========================
const visibleMenu = computed(() =>
  menu
    .filter((section) => section.roles.includes(userRole.value))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || item.roles.includes(userRole.value)),
    })),
)
</script>

<style scoped>
/* Estilos para asegurar la estructura de diseño y el control del scroll */

.app-sidebar {
  /* ESTRUCTURA FLEXBOX: Clave para el scroll */
  display: flex;
  flex-direction: column;
  /* El ASIDE necesita una altura definida para que flex-grow: 1 funcione */
  height: 98%;

  overflow-y: hidden; /* Evita scroll en el sidebar completo */
  overflow-x: hidden;
  border-radius: 8px;
  margin: 5px 0px 5px 5px;
}

/* HEADER */
.sidebar-header {
  min-height: 60px;
  border-bottom: 1px solid var(--bs-secondary);
  padding: 10px 15px !important;
  flex-shrink: 0;
}

/* FOOTER */
.sidebar-footer {
  min-height: 50px;
  background-color: #212529;
  border-top: 1px solid #343a40;
  padding: 10px 15px !important;
  flex-shrink: 0;
  margin-top: auto; /* Empuja el footer hacia abajo */
}

/* CONTENIDO DE NAVEGACIÓN: Única área con scroll */
.sidebar-nav-content {
  overflow-y: auto;
  overflow-x: hidden;
  flex-grow: 1; /* Ocupa todo el espacio disponible entre header y footer */
}

/* Ocultar scrollbar si es necesario (solo en webkit browsers) */
.sidebar-nav-content::-webkit-scrollbar {
  display: none !important;
  width: 0;
}

/* SECCIONES Y TÍTULOS */
.menu-section {
  margin-bottom: 1rem;
}
.menu-title {
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
}
.nav-link {
  display: flex;
  align-items: center;
  border-radius: 8px;
  padding-left: 0.75rem !important;
}

/* ESTILOS DE ESTADO (ACTIVO) */
.nav-link.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.12);
  font-weight: 600;
}
.nav-link.router-link-exact-active i {
  color: #0d6efd;
}

/* ESTILOS DE COLAPSO */
.app-sidebar.collapsed .sidebar-header {
  justify-content: center !important;
}
.app-sidebar.collapsed .sidebar-footer {
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}
.app-sidebar.collapsed .menu-title {
  display: none !important;
}
/* Estilo para el elemento activo en modo colapsado */
.app-sidebar.collapsed .nav-link {
  justify-content: center;
  padding-left: 0.5rem !important;
}
.app-sidebar.collapsed .nav-link.router-link-exact-active {
  border-left: 4px solid #0d6efd;
  background-color: rgba(13, 110, 253, 0.15);
}

.branding-wrap {
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.2;
  max-height: 3em;
  text-align: center;
}
</style>
