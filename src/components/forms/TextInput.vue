<template>
  <div class="mb-3">
    <label :for="id" class="form-label">{{ label }}</label>
    <input
      :type="type"
      :id="id"
      class="form-control"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :required="required"
      :step="step"
    />
    <div v-if="error" class="text-danger small">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: [String, Number], required: true },
  type: { type: String, default: 'text' },
  required: { type: Boolean, default: false },
  step: { type: String, default: null },
  error: { type: String, default: null },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
/* Add any specific styles for the input field here */
</style>
