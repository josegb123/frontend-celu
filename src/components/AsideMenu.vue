<template>
  <aside
    :class="['app-sidebar', { collapsed: layoutStore.isSidebarCollapsed }]"
    v-if="isAuthenticated"
  >
    <nav class="p-2">
      <ul class="nav flex-column">
        <li class="nav-item">
          <a class="nav-link text-white" href="#"
            ><i class="bi bi-house me-2"></i><span>Inicio</span></a
          >
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'VentaNueva' }" class="nav-link text-white"
            ><i class="bi bi-cart me-2"></i><span>Ventas</span></router-link
          >
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'Productos' }" class="nav-link text-white"
            ><i class="bi bi-box me-2"></i><span>Productos</span></router-link
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
