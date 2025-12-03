<template>
  <div id="app" class="app-layout">
    <CajaBloqueador v-if="authStore.isAuthenticated">
      <NavBar @show-cierre-modal="showCerrarCajaModal = true" />
      <div class="main-container">
        <AsideMenu />
        <main class="app-content">
          <RouterView />
        </main>
      </div>
    </CajaBloqueador>

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
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref } from 'vue'
import AsideMenu from './components/navigation/AsideMenu.vue'
import NavBar from './components/navigation/NavBar.vue'
import CajaBloqueador from './components/shared/CajaBloqueador.vue'
import { useThemeStore } from './store/themeStore'
import { useAuthStore } from './store/authStore'
import router from './router'
import CerrarCajaModal from './components/shared/CerrarCajaModal.vue'

// Inicialización de Stores
const themeStore = useThemeStore()
const authStore = useAuthStore()

/** Maneja el evento cuando la caja se ha cerrado exitosamente */
const showCerrarCajaModal = ref(false)

function applyThemeAttribute(isDark: boolean) {
  const element = document.documentElement // Elemento HTML raíz

  if (isDark) {
    element.setAttribute('data-bs-theme', 'dark')
  } else {
    element.setAttribute('data-bs-theme', 'light')
  }
}

// Lógica de chequeo de sesión al inicio
onMounted(() => {
  // Es vital verificar la sesión al inicio para que isAuthenticated refleje el estado real

  authStore.checkSession()
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
  // Cerramos el modal
  showCerrarCajaModal.value = false

  // Una vez que la caja está cerrada, intentamos el logout de nuevo.
  // Ahora debería tener éxito y redirigir al usuario al login.
  const loggedOut = await authStore.logout()

  // Si fue exitoso (loggedOut === true), el router lo llevará a 'auth'
  if (loggedOut) {
    router.push({ name: 'auth' })
  } else {
    // En un escenario normal, esto no debería ocurrir si la caja se cerró.
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
