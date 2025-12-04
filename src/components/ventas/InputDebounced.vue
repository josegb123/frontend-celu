<template>
  <input
    type="text"
    :value="modelValue"
    @input="handleInput"
    :placeholder="placeholder"
    class="form-control"
  />
</template>

<script setup lang="ts">
// --- PROPS ---
const props = defineProps<{
  // El valor inicial del input (usando v-model)
  modelValue: string
  // Placeholder opcional
  placeholder?: string
  // Tiempo de espera en milisegundos (por defecto 300ms)
  delay?: number
}>()

// --- EMITS ---
const emit = defineEmits<{
  // Evento estándar de v-model:update
  (e: 'update:modelValue', value: string): void
  // Evento que usaremos para notificar a la vista padre que debe aplicar el filtro
  (e: 'search', value: string): void
}>()

// --- ESTADO INTERNO ---
// Referencia para almacenar el temporizador
let timeoutId: number | null = null

/**
 * @description Maneja la entrada del usuario, actualiza el valor y aplica el debounce.
 * @param event Evento de entrada del input.
 */
function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value

  // 1. Limpiar cualquier temporizador anterior
  if (timeoutId !== null) {
    clearTimeout(timeoutId)
  }

  // 2. Emitir inmediatamente el valor para actualizar el v-model en el padre (sin filtro aún)
  emit('update:modelValue', value)

  // 3. Establecer el nuevo temporizador de debounce
  timeoutId = setTimeout(() => {
    // Solo emitimos el evento 'search' si el valor es válido (no queremos buscar cadenas muy cortas)
    if (value.length >= 2 || value.length === 0) {
      emit('search', value)
    }
    timeoutId = null
  }, props.delay || 300) as unknown as number // El 'as unknown as number' es para manejar el tipo de retorno de setTimeout en TS.
}
</script>
