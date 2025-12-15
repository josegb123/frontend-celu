<template>
  <header class="navbar navbar-expand-lg sticky-top bg-dark navbar-dark shadow-sm p-2 z-3">
    <div class="container-fluid">
      <div class="d-flex align-items-center me-auto">
        <div class="d-flex align-items-center">
          <button
            class="btn btn-outline-light me-3"
            @click="layoutStore.toggleSidebar()"
            aria-label="Toggle navigation"
            v-if="isAuthenticated"
          >
            <i class="bi bi-list"></i>
          </button>
        </div>

        <router-link :to="{ name: 'home' }" class="navbar-brand p-0 fw-bold fs-6 text-uppercase">{{
          appConfig.getBusinessName // Changed here
        }}</router-link>

        <span class="text-white-50 ms-3 d-none d-sm-inline fs-6" v-if="isAuthenticated">{{
          $route.meta.title || 'Panel Principal'
        }}</span>
      </div>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav align-items-center">
          <div class="d-flex align-items-center p-1 gap-2">
            <button
              @click="themeStore.toggleDarkMode"
              class="btn btn-sm"
              :class="themeStore.isDarkMode ? 'btn-light' : 'btn-dark'"
              title="Cambiar Tema"
            >
              <i v-if="themeStore.isDarkMode" class="bi bi-sun-fill me-1"></i>
              <i v-else class="bi bi-moon-fill me-1"></i>

              <span class="d-none d-sm-inline">
                {{ themeStore.isDarkMode ? 'Claro' : 'Oscuro' }}
              </span>
            </button>
            <UserProfileMenu v-if="isAuthenticated" @show-cierre-modal="handleShowCierreModal" />
          </div>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/authStore'
import { storeToRefs } from 'pinia'
import UserProfileMenu from '../users/UserProfileMenu.vue'
import { useLayoutStore } from '@/store/layoutStore'
import { useThemeStore } from '@/store/themeStore'
import { useAppConfigStore } from '@/store/useAppConfigStore' // Added this import

// 1. Definir los eventos que este componente puede emitir
const emit = defineEmits(['showCierreModal'])

const appConfig = useAppConfigStore(); // Added this
const layoutStore = useLayoutStore()

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const themeStore = useThemeStore()

/**
 * 2. Función para reemitir el evento del componente hijo (UserProfileMenu)
 * hacia el componente padre (App.vue).
 */
function handleShowCierreModal() {
  emit('showCierreModal')
}
</script>

<style scoped>
/* Redefinición para que los nav-link dentro de los botones no tengan padding extra */
.navbar-nav .nav-link {
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
}

.nav-link {
  color: var(--bs-white) !important;
}

/* Ajuste específico para el botón de la navbar si estás usando .nav-link dentro de .btn */
.nav-item .btn {
  /* Asegurar que la altura del botón sea mínima */
  line-height: 1.2;
  padding: 0.25rem 0.5rem;
}

.nav-item .router-link-active {
  color: var(--bs-primary) !important;
  background-color: var(--bs-white) !important;
  border-color: var(--bs-white) !important;
}
</style>