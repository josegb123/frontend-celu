<template>
  <aside
    :class="['app-sidebar', { collapsed: layoutStore.isSidebarCollapsed }]"
    v-if="isAuthenticated"
  >
    <div class="sidebar-header d-flex align-items-center justify-content-start p-3">
      <button
        class="btn btn-icon text-white"
        @click="layoutStore.toggleSidebar()"
        aria-label="Toggle navigation"
      >
        <i class="bi" :class="layoutStore.isSidebarCollapsed ? 'bi-list' : 'bi-arrow-bar-left'"></i>
      </button>

      <router-link
        :to="{ name: 'home' }"
        class="navbar-brand fw-bold fs-6 text-uppercase text-white truncate-text ms-3"
        v-if="!layoutStore.isSidebarCollapsed"
      >
        <span class="branding-wrap">{{ nameBranding }}</span>
      </router-link>
    </div>

    <nav class="p-2 flex-grow-1 sidebar-nav-content">
      <div class="menu-section">
        <p class="menu-title text-white-50 px-3 py-1 mb-1" v-if="!layoutStore.isSidebarCollapsed">
          Operaciones
        </p>
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link :to="{ name: 'home' }" class="nav-link text-white"
              ><i class="bi bi-house me-2"></i><span>Inicio</span></router-link
            >
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'pos' }" class="nav-link text-white"
              ><i class="bi bi-cart me-2"></i><span>Punto de Venta</span></router-link
            >
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'ventas' }" class="nav-link text-white"
              ><i class="bi bi-receipt me-2"></i><span>Historial Ventas</span></router-link
            >
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'notificaciones' }" class="nav-link text-white"
              ><i class="bi bi-bell me-2"></i><span>Notificaciones</span></router-link
            >
          </li>
        </ul>
      </div>

      <div class="menu-section">
        <p class="menu-title text-white-50 px-3 py-1 mb-1" v-if="!layoutStore.isSidebarCollapsed">
          Inventario & Compras
        </p>
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link :to="{ name: 'Productos' }" class="nav-link text-white"
              ><i class="bi bi-box me-2"></i><span>Productos</span></router-link
            >
          </li>
          <li class="nav-item" v-if="isAdmin">
            <router-link :to="{ name: 'DevolucionGestion' }" class="nav-link text-white"
              ><i class="bi bi-arrow-counterclockwise me-2"></i
              ><span>Devoluciones</span></router-link
            >
          </li>
          <li class="nav-item" v-if="isAdmin">
            <router-link :to="{ name: 'Proveedores' }" class="nav-link text-white"
              ><i class="bi bi-truck me-2"></i><span>Proveedores</span></router-link
            >
          </li>
          <li class="nav-item" v-if="isAdmin">
            <router-link :to="{ name: 'RecibirPedidos' }" class="nav-link text-white"
              ><i class="bi bi-truck-flatbed me-2"></i><span>Recibir Pedidos</span></router-link
            >
          </li>
        </ul>
      </div>

      <div class="menu-section">
        <p class="menu-title text-white-50 px-3 py-1 mb-1" v-if="!layoutStore.isSidebarCollapsed">
          Finanzas
        </p>
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link :to="{ name: 'Clientes' }" class="nav-link text-white"
              ><i class="bi bi-person me-2"></i><span>Clientes</span></router-link
            >
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'cuentas' }" class="nav-link text-white"
              ><i class="bi bi-wallet2 me-2"></i><span>Cuentas por Cobrar</span></router-link
            >
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'movimientos' }" class="nav-link text-white"
              ><i class="bi bi-journal-text me-2"></i
              ><span>Movimientos Financieros</span></router-link
            >
          </li>
        </ul>
      </div>

      <div class="menu-section" v-if="isAdmin">
        <p class="menu-title text-white-50 px-3 py-1 mb-1" v-if="!layoutStore.isSidebarCollapsed">
          Administración
        </p>
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link :to="{ name: 'Usuarios' }" class="nav-link text-white">
              <i class="bi bi-people me-2"></i><span>Usuarios</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'AdminReports' }" class="nav-link text-white">
              <i class="bi bi-graph-up me-2"></i><span>Reportes y Estadísticas</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <div
      class="sidebar-footer p-2 border-top border-secondary d-flex align-items-center justify-content-between"
    >
      <div class="d-flex align-items-center">
        <UserProfileMenu v-if="isAuthenticated" @show-cierre-modal="handleShowCierreModal" />
        <span class="ms-2 text-white truncate-text" v-if="!layoutStore.isSidebarCollapsed">
          {{ authStore.user?.name || 'Usuario' }}
        </span>
      </div>
      <button
        @click="themeStore.toggleDarkMode"
        class="btn btn-sm"
        :class="themeStore.isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'"
        title="Cambiar Tema"
      >
        <i v-if="themeStore.isDarkMode" class="bi bi-sun-fill"></i>
        <i v-else class="bi bi-moon-fill"></i>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/authStore'
import { storeToRefs } from 'pinia'
import { useLayoutStore } from '@/store/layoutStore'
import UserProfileMenu from '../users/UserProfileMenu.vue'
import { useThemeStore } from '@/store/themeStore'
import { computed } from 'vue' // Added

// Definiciones

const emit = defineEmits(['showCierreModal'])
const nameBranding = import.meta.env.VITE_BRANDING_NAME
const layoutStore = useLayoutStore()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const themeStore = useThemeStore()

// Added computed properties for roles
const isAdmin = computed(() => {
  return authStore.user?.role === 'administrador' || authStore.user?.role === 'admin'
})

// const isVendedor = computed(() => { // Not used directly in template but good for consistency
//   return authStore.user?.role === 'vendedor'
// })

function handleShowCierreModal() {
  emit('showCierreModal')
}
</script>

<style scoped>
/* Estilos para asegurar la estructura de diseño oscuro minimalista */

.app-sidebar {
  /* Estructura principal: Usar flex-direction: column es clave para el header/nav/footer */
  display: flex;
  flex-direction: column;
  /* Las propiedades de width y background las estás definiendo en tu SCSS global, lo cual es ideal. */

  /* 1. Ocultar scrollbar en el ASIDE principal */
  overflow-y: hidden;
  overflow-x: hidden;
  border-radius: 8px;
  margin: 5px 0px 5px 5px;
}

/* HEADER */
.sidebar-header {
  min-height: 60px;
  border-bottom: 1px solid var(--bs-secondary);
  padding: 10px 15px !important;
  flex-shrink: 0; /* Evita que el header se encoja */
}

/* FOOTER */
.sidebar-footer {
  min-height: 50px;
  background-color: #212529;
  border-top: 1px solid #343a40;
  padding: 10px 15px !important;
  flex-shrink: 0; /* Evita que el footer se encoja */
}

/* CONTENIDO DE NAVEGACIÓN: Permite el scroll solo en esta área */
.sidebar-nav-content {
  overflow-y: scroll;
  overflow-x: hidden;
  flex-grow: 1;
}

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
  border-radius: 8px; /* Debe coincidir con tu SCSS global */
  padding-left: 0.75rem !important;
}

/* ESTILOS DE COLAPSO */

/* Aseguran que no haya scroll horizontal al colapsar y centran elementos */
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
.branding-wrap {
  white-space: normal; /* Sobrescribe white-space: nowrap; si lo tienes en truncate-text */
  word-wrap: break-word; /* Permite que el texto largo se ajuste */
  line-height: 1.2;
  max-height: 3em; /* Limita a 2-3 líneas para evitar que crezca demasiado */
  text-align: center;
}
</style>
