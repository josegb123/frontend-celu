<template>
  <div id="app" class="app-layout">
    <NavBar />

    <RouterView class="main-content-area" />
  </div>
</template>

<script setup lang="ts">
import NavBar from './components/NavBar.vue'
</script>

<style>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content-area {
  flex-grow: 1;
  overflow-y: auto;
  height: 100%;
}

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
