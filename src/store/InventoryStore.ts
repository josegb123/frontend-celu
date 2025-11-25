import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInventoryStore = defineStore('inventory', () => {
  // ⬅️ Este valor se incrementará cada vez que se complete una venta exitosa.
  const saleUpdateCounter = ref(0)

  // Método para ser llamado por el componente VentaForm
  function notifySaleCompleted() {
    saleUpdateCounter.value++
  }

  return { saleUpdateCounter, notifySaleCompleted }
})
