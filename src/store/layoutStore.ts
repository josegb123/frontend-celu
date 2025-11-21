import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  // Estado para saber si la sidebar está colapsada (true) o expandida (false)
  const isSidebarCollapsed = ref(false)

  // Acción (Mutación) para cambiar el estado
  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  // Acción para forzar un estado específico (útil para dispositivos móviles)
  function setSidebarState(state: boolean) {
    isSidebarCollapsed.value = state
  }

  return { isSidebarCollapsed, toggleSidebar, setSidebarState }
})
