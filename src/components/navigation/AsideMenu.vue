<template>
  <aside
    :class="['app-sidebar', { collapsed: layoutStore.isSidebarCollapsed }]"
    v-if="isAuthenticated"
  >
    <nav class="p-2">
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link :to="{ name: 'home' }" class="nav-link text-white"
            ><i class="bi bi-house me-2"></i><span>Inicio</span></router-link
          >
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'pos' }" class="nav-link text-white"
            ><i class="bi bi-cart me-2"></i><span>Ventas</span></router-link
          >
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'ventas' }" class="nav-link text-white"
            ><i class="bi bi-receipt me-2"></i><span>Ventas</span></router-link
          >
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'Productos' }" class="nav-link text-white"
            ><i class="bi bi-box me-2"></i><span>Productos</span></router-link
          >
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'Proveedores' }" class="nav-link text-white"
            ><i class="bi bi-truck me-2"></i><span>Proveedores</span></router-link
          >
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'RecibirPedidos' }" class="nav-link text-white"
            ><i class="bi bi-truck-flatbed me-2"></i><span>Recibir Pedidos</span></router-link
          >
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'Usuarios' }" class="nav-link text-white">
            <i class="bi bi-people me-2"></i><span>Usuarios</span>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'notificaciones' }" class="nav-link text-white"
            ><i class="bi bi-bell me-2"></i><span>Notificaciones</span></router-link
          >
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'cuentas' }" class="nav-link text-white"
            ><i class="bi bi-wallet2 me-2"></i><span>Cuentas por Cobrar</span></router-link
          >
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'movimientos' }" class="nav-link text-white"
            ><i class="bi bi-journal-text me-2"></i><span>Movimientos</span></router-link
          >
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/authStore'
import { storeToRefs } from 'pinia'
import { useLayoutStore } from '@/store/layoutStore'
const layoutStore = useLayoutStore()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
</script>

<style scoped></style>
