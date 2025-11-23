<template>
  <div class="categoria-filter">
    <label for="categoriaFilter" class="form-label visually-hidden">Filtrar por Categoría</label>
    <select
      id="categoriaFilter"
      class="form-select"
      v-model="selectedcategoriaId"
      @change="emitcategoriaChange"
    >
      <option :value="null">Todas las Categorías</option>
      <option v-for="categoria in props.categories" :key="categoria.id" :value="categoria.id">
        {{ categoria.nombre }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ICategoria } from '@/interfaces/ICategoria'

const emit = defineEmits(['categoriaSelected'])
const props = defineProps<{ categories: ICategoria[] }>()

// Estado local
const selectedcategoriaId = ref<number | null>(null)

/**
 * Emite el ID de la categoría seleccionada al componente padre.
 */
const emitcategoriaChange = () => {
  emit('categoriaSelected', selectedcategoriaId.value)
}
</script>

<style scoped>
.categoria-filter .form-select {
  height: 40px;
}
</style>
