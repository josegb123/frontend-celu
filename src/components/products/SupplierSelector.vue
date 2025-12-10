<template>
  <div>
    <div class="input-group mb-2">
      <select class="form-select" v-model="supplierToAddId" :disabled="isLoading">
        <option disabled :value="null">
          {{ isLoading ? 'Cargando proveedores...' : 'Seleccione un proveedor para agregar' }}
        </option>

        <option
          v-for="supplier in availableSuppliers"
          :key="supplier.id"
          :value="supplier.id"
          :disabled="isSelected(supplier.id)"
        >
          {{ supplier.nombreComercial }} (ID: {{ supplier.id }})
        </option>
      </select>

      <button
        type="button"
        class="btn btn-primary"
        @click="addSelectedSupplier"
        :disabled="!supplierToAddId || isLoading"
        title="Agregar proveedor seleccionado"
      >
        <i class="bi bi-plus-lg"></i> Agregar
      </button>
    </div>

    <div v-if="isLoading" class="text-center small text-primary mt-1">Cargando opciones...</div>
    <div
      v-else-if="availableSuppliers.length === 0 && selectedSuppliers.length === 0"
      class="text-center small text-muted mt-1"
    >
      No se encontraron proveedores activos para seleccionar.
    </div>

    <div v-if="selectedSuppliers.length > 0" class="mt-3 d-flex flex-wrap gap-2">
      <span
        v-for="supplier in selectedSuppliers"
        :key="supplier.id"
        class="badge bg-secondary p-2 d-flex align-items-center"
      >
        {{ supplier.nombreComercial }}
        <button
          type="button"
          class="btn-close btn-close-white ms-2"
          aria-label="Eliminar"
          @click="removeSupplier(supplier.id)"
        ></button>
      </span>
    </div>
    <div v-else-if="!isLoading" class="small text-muted mt-3">
      Aún no se ha seleccionado ningún proveedor.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { proveedorService, type Proveedor } from '@/services/proveedorService'

// --- PROPS y EMITS ---
const props = defineProps<{
  /** Array de IDs de proveedores ya asignados (para el modo edición). */
  initialSupplierIds: number[]
}>()

const emit = defineEmits<{
  /** Evento emitido con la lista actualizada de IDs de proveedores. */
  (e: 'update:supplier-ids', ids: number[]): void
}>()

// --- ESTADO LOCAL ---
const allSuppliers = ref<Proveedor[]>([])
const supplierToAddId = ref<number | null>(null)
const selectedSuppliers = ref<Proveedor[]>([])
const isLoading = ref(false)

// --- CÁLCULOS ---

/**
 * Proveedores que aún no han sido seleccionados (para llenar el select).
 */
const availableSuppliers = computed(() => {
  const selectedIds = new Set(selectedSuppliers.value.map((s) => s.id))
  return allSuppliers.value.filter((s) => !selectedIds.has(s.id))
})

/**
 * Verifica si un proveedor ya ha sido seleccionado.
 */
const isSelected = (id: number) => {
  return selectedSuppliers.value.some((s) => s.id === id)
}

// --- LÓGICA DE DATOS ---

/**
 * Carga todos los proveedores disponibles desde el backend.
 */
const loadAllSuppliers = async () => {
  isLoading.value = true
  try {
    allSuppliers.value = await proveedorService.getAllProveedoresNoPaginado()
  } catch (error) {
    console.error('Error al cargar la lista completa de proveedores:', error)
    allSuppliers.value = []
  } finally {
    isLoading.value = false
  }
}

/**
 * Agrega el proveedor seleccionado del <select> a la lista.
 */
const addSelectedSupplier = () => {
  if (!supplierToAddId.value) return

  const id = supplierToAddId.value
  const supplier = allSuppliers.value.find((s) => s.id === id)

  if (supplier && !isSelected(id)) {
    selectedSuppliers.value.push(supplier)
    emitSupplierIds()
  }

  // MEJORA UX: Limpiar o seleccionar el siguiente disponible.
  // Opción 1 (Limpiar):
  supplierToAddId.value = null

  // Opción 2 (Seleccionar el siguiente disponible - descomentar si se prefiere):
  /*
  supplierToAddId.value = availableSuppliers.value.length > 0
    ? availableSuppliers.value[0].id
    : null
  */
}

/**
 * Remueve un proveedor de la lista de seleccionados.
 */
const removeSupplier = (id: number) => {
  selectedSuppliers.value = selectedSuppliers.value.filter((s) => s.id !== id)
  emitSupplierIds()
}
const emitSupplierIds = () => {
  const currentIds = selectedSuppliers.value.map((s) => s.id)

  // *** VERIFICACIÓN CLAVE ***
  // Solo emitir si los IDs actuales difieren de los que el padre nos pasó inicialmente.
  // Esto evita la recursión cuando los datos ya están sincronizados.
  if (!arraysAreEqual(currentIds, props.initialSupplierIds)) {
    emit('update:supplier-ids', currentIds)
  }
}
const arraysAreEqual = (arr1: number[], arr2: number[]) => {
  if (arr1.length !== arr2.length) return false
  const sorted1 = [...arr1].sort((a, b) => a - b)
  const sorted2 = [...arr2].sort((a, b) => a - b)
  return sorted1.every((value, index) => value === sorted2[index])
}
// --- WATCHERS y LÓGICA DE INICIALIZACIÓN (MEJORADO) ---

/**
 * Lógica de inicialización para el modo edición.
 * Carga los objetos Proveedor completos basados en los IDs iniciales.
 * (Asume que allSuppliers ya ha cargado o lo hará asíncronamente si es necesario)
 */
const initializeSelectedSuppliers = (newIds: number[]) => {
  // 1. Verificar si la data ya está sincronizada al inicio
  if (
    arraysAreEqual(
      selectedSuppliers.value.map((s) => s.id),
      newIds,
    )
  ) {
    // Si ya coinciden, no hacemos nada más, rompemos la recursión.
    return
  }

  if (newIds && newIds.length > 0 && allSuppliers.value.length > 0) {
    selectedSuppliers.value = allSuppliers.value.filter((s) => newIds.includes(s.id))
  } else if (!newIds || newIds.length === 0) {
    selectedSuppliers.value = []
  }

  // 2. Ejecutar la emisión (que ahora tiene una verificación interna)
  emitSupplierIds()
}

// 1. CARGA INICIAL Y PRIMERA INICIALIZACIÓN
onMounted(async () => {
  await loadAllSuppliers()

  // Una vez que allSuppliers cargó, inicializa selectedSuppliers con los IDs iniciales.
  // Esto maneja correctamente el modo edición al cargar el componente.
  initializeSelectedSuppliers(props.initialSupplierIds)
})

// 2. REACCIÓN A CAMBIOS POSTERIORES DE LA PROP
watch(
  () => props.initialSupplierIds,
  (newIds) => {
    // Si la prop cambia (ej. el usuario empieza a editar un nuevo producto),
    // reinicializamos. No necesitamos 'immediate: true' aquí porque la primera
    // inicialización la maneja el onMounted.
    initializeSelectedSuppliers(newIds)
  },
)
</script>

<style scoped>
/* Estilos si fueran necesarios */
</style>
