<script setup lang="ts">
import { useCurrencyInput } from 'vue-currency-input'
import { watch } from 'vue'

const props = defineProps<{ modelValue: number | null; maxValue: number | null }>()
defineEmits<{ 'update:modelValue': number }>()

// Configuramos el hook para solo formato numérico, sin símbolo de moneda
const { inputRef, formattedValue, numberValue, setValue } = useCurrencyInput({
  locale: 'es-CO',
  currency: 'COP',
  hideCurrencySymbolOnFocus: true,
  hideGroupingSeparatorOnFocus: false,
  precision: 0,
  valueRange: { min: 0 },
})

// Función para establecer el valor del input a 0
const clearValue = () => {
  setValue(0)
}

watch(
  () => props.modelValue,
  (value) => {
    if (value !== numberValue.value) {
      setValue(value)
    }
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="input-group">
    <input
      type="text"
      v-model="formattedValue"
      ref="inputRef"
      class="form-control text-end"
      placeholder="Valor numérico"
      min="0"
      :max="maxValue ?? undefined"
    />

    <button
      class="btn btn-outline-danger"
      type="button"
      @click="clearValue"
      title="Limpiar valor (establecer a 0)"
    >
      <i class="bi bi-trash-fill small"></i>
    </button>
  </div>
</template>

<style scoped>
/* Sin estilos personalizados. Usando clases de Bootstrap. */
</style>
