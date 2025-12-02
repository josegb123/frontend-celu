<script setup lang="ts">
// 1. Definición de Props: Recibe el valor actual de la búsqueda (v-model)
const props = defineProps<{
  searchValue: string
}>()

// 2. Definición de Emits: Eventos que envía al componente padre (ProveedorGestion)
const emit = defineEmits(['update:searchValue', 'searchConfirmed', 'openCreate'])

// Función auxiliar para emitir el evento de actualización del v-model
function updateSearch(event: Event) {
  emit('update:searchValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="card mb-4 shadow-sm">
    <div
      class="card-body d-flex flex-column flex-sm-row justify-content-between align-items-center"
    >
      <div class="w-100 me-sm-3 mb-3 mb-sm-0">
        <div class="input-group">
          <input
            :value="searchValue"
            @input="updateSearch"
            @keyup.enter="emit('searchConfirmed')"
            type="text"
            class="form-control"
            placeholder="Buscar por nombre, identificación o email..."
          />
          <button class="btn btn-outline-secondary" type="button" @click="emit('searchConfirmed')">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>

      <button @click="emit('openCreate')" class="btn btn-primary w-100 w-sm-auto text-nowrap">
        <i class="bi bi-plus-lg me-1"></i> + Nuevo Proveedor
      </button>
    </div>
  </div>
</template>
