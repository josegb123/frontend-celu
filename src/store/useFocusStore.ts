import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFocusStore = defineStore('focus', () => {
  const focusedElement = ref<string | null>(null)
  
  const setFocus = (elementId: string) => {
    focusedElement.value = elementId
  }
  
  const clearFocus = () => {
    focusedElement.value = null
  }
  
  return {
    focusedElement,
    setFocus,
    clearFocus
  }
})