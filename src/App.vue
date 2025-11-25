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
import AsideMenu from './components/AsideMenu.vue'
import NavBar from './components/NavBar.vue'
import 'vue-draggable-resizable/style.css'
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
