<template>
  <div class="mb-3">
    <label :for="id" class="form-label">{{ label }}</label>
    <input
      type="number"
      :id="id"
      class="form-control"
      v-model.number="localValue"
      :required="required"
      :step="step"
    />
    <div v-if="error" class="text-danger small">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: Number, required: true },
  required: { type: Boolean, default: false },
  step: { type: String, default: '0.01' },
  error: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue'])

const localValue = computed({
  get: () => props.modelValue,
  set: (val: number) => emit('update:modelValue', val),
})
</script>

<style scoped>
/* Add any specific styles for the input field here */
</style>
