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
        <router-link
          v-if="$route.name === 'PostDetail'"
          :to="{ name: 'PostList' }"
          class="me-3 py-1"
        >
          <i class="bi bi-arrow-left fs-5 text-white"></i>
        </router-link>

        <router-link :to="{ name: 'home' }" class="navbar-brand p-0 fw-bold fs-6 text-uppercase"
          >E-Store Admin</router-link
        >

        <span class="text-white-50 ms-3 d-none d-sm-inline fs-6">{{
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
          <li class="nav-item me-2" v-if="isAuthenticated">
            <router-link
              :to="{ name: 'PostList' }"
              class="btn btn-sm btn-outline-light nav-link py-1"
              >Posts</router-link
            >
          </li>

          <li class="nav-item me-2" v-if="!isAuthenticated">
            <router-link
              :to="{ name: 'register' }"
              class="btn btn-sm btn-outline-light nav-link py-1"
              >Registrarse</router-link
            >
          </li>
          <li class="nav-item me-3" v-if="!isAuthenticated">
            <router-link :to="{ name: 'auth' }" class="btn btn-sm btn-light nav-link py-1 fw-bold"
              >Iniciar Sesión</router-link
            >
          </li>
          <div class="d-flex align-items-center py-1">
            <UserProfileMenu v-if="isAuthenticated" />
          </div>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/authStore'
import { storeToRefs } from 'pinia'
import UserProfileMenu from './UserProfileMenu.vue'
import { useLayoutStore } from '@/store/layoutStore'

const layoutStore = useLayoutStore()

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
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
