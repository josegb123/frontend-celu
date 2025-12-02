<template>
  <div id="app" class="app-layout">
    <NavBar />
    <div class="main-container">
      <AsideMenu />
      <main class="app-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import AsideMenu from './components/navigation/AsideMenu.vue'
import NavBar from './components/navigation/NavBar.vue'
import { useThemeStore } from './store/themeStore'

const themeStore = useThemeStore()
function applyThemeAttribute(isDark: boolean) {
  const element = document.documentElement // Elemento HTML raíz

  if (isDark) {
    // Establecer el atributo oficial de Bootstrap
    element.setAttribute('data-bs-theme', 'dark')
  } else {
    // Establecer el modo claro
    element.setAttribute('data-bs-theme', 'light')
    // Nota: Aunque puedes removerlo, es más seguro establecer 'light' explícitamente.
  }
}

watch(
  () => themeStore.isDarkMode,
  (newVal) => {
    applyThemeAttribute(newVal)
  },
  { immediate: true },
)
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

:root {
  /* Sobrescribe la variable global de color de borde de Bootstrap */
  --bs-border-color: #b9b9b9;
  /* Un gris más oscuro */
  --bs-border-color-translucent: rgba(0, 0, 0, 0.116);
  /* Oscurecer también las variantes transparentes */
}
</style>
