<template>
  <div class="mb-3">
    <label :for="id" class="form-label">{{ label }}</label>
    <div class="input-group">
      <select
        :id="id"
        class="form-select"
        :value="modelValue"
        @input="
          $emit(
            'update:modelValue',
            $event.target ? ($event.target as HTMLSelectElement).value : '',
          )
        "
        :required="required"
      >
        <option disabled value="">Seleccione una opción</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
    <div v-if="error" class="text-danger small">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: [String, Number], required: true },
  options: {
    type: Array as () => Array<{ value: string | number; label: string }>,
    required: true,
  },
  required: { type: Boolean, default: false },
  error: { type: String, default: null },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
/* Add any specific styles for the select field here */
</style>
