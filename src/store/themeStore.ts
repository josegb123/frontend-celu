// stores/themeStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 1. STATE: Estado del modo oscuro (por defecto: falso)
  const isDarkMode = ref(false)

  // 2. ACTIONS: Función para cambiar y guardar la preferencia
  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    // Guardar la preferencia en el localStorage para persistencia
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  }

  // 3. Inicialización: Leer la preferencia al cargar el store
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    // Si la preferencia es 'dark', se activa el modo oscuro
    isDarkMode.value = savedTheme === 'dark'
  }

  return { isDarkMode, toggleDarkMode }
})
