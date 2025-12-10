<template>
  <div id="app" class="app-layout">
    <template v-if="authStore.isAuthenticated">
      <!--       <NavBar @show-cierre-modal="showCerrarCajaModal = true" /> -->
      <div class="main-container">
        <AsideMenu @show-cierre-modal="showCerrarCajaModal = true" />
        <main class="app-content">
          <RouterView />
        </main>
      </div>
    </template>

    <template v-else>
      <main class="app-content-full">
        <RouterView />
      </main>
    </template>

    <CerrarCajaModal
      v-if="showCerrarCajaModal"
      @close="showCerrarCajaModal = false"
      @closed="handleCajaClosed"
    />
    <div id="teleported-layer"></div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref } from 'vue'
import AsideMenu from './components/navigation/AsideMenu.vue'
import { useThemeStore } from './store/themeStore'
import { useAuthStore } from './store/authStore'
import router from './router'
import CerrarCajaModal from './components/shared/CerrarCajaModal.vue'
import { useCajaStore } from './store/useCajaStore'

// Inicialización de Stores
const themeStore = useThemeStore()
const authStore = useAuthStore()
const cajaStore = useCajaStore()

const showCerrarCajaModal = ref(false)

function applyThemeAttribute(isDark: boolean) {
  const element = document.documentElement // Elemento HTML raíz

  if (isDark) {
    element.setAttribute('data-bs-theme', 'dark')
  } else {
    element.removeAttribute('data-bs-theme')
  }
}

// Lógica de chequeo de sesión al inicio
onMounted(() => {
  authStore.checkSession()
  if (!cajaStore.isCajaAbierta && !cajaStore.isLoading) {
    cajaStore.fetchCajaActiva()
  }
})

watch(
  () => themeStore.isDarkMode,
  (newVal) => {
    applyThemeAttribute(newVal)
  },
  { immediate: true },
)

/** * @description Maneja el evento emitido cuando la caja ha sido cerrada exitosamente desde el modal.
 * Debe forzar el cierre de sesión si el proceso de cierre fue iniciado por un intento de logout.
 */
async function handleCajaClosed() {
  showCerrarCajaModal.value = false

  const loggedOut = await authStore.logout()

  if (loggedOut) {
    router.push({ name: 'auth' })
  } else {
    console.error('App.vue: Fallo inesperado después del cierre de caja al intentar hacer logout.')
  }
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

:root {
  /* Sobrescripciones de variables de Bootstrap */
  --bs-border-color: #b9b9b9;
  --bs-border-color-translucent: rgba(0, 0, 0, 0.116);
}

.app-content-full {
  /* Estilo para cuando solo se muestra el RouterView (ej: Login) */
  width: 100vw;
  height: 100vh;
}
</style>
