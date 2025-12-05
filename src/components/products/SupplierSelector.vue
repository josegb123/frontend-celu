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
    <div v-else-if="availableSuppliers.length === 0" class="text-center small text-muted mt-1">
      No se encontraron proveedores activos.
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
    <div v-else class="small text-muted mt-3">Aún no se ha seleccionado ningún proveedor.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, computed, onMounted } from 'vue'
// 🚨 Importar el servicio y la interfaz
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
// Lista completa de todos los proveedores disponibles
const allSuppliers = ref<Proveedor[]>([])
// El ID del proveedor seleccionado actualmente en el <select>
const supplierToAddId = ref<number | null>(null)
// Los objetos Proveedor que ya han sido seleccionados
const selectedSuppliers = ref<Proveedor[]>([])
const isLoading = ref(false)

// --- CÁLCULOS ---

/**
 * Proveedores que aún no han sido seleccionados (para llenar el select).
 */
const availableSuppliers = computed(() => {
  // Filtramos la lista completa para remover los que ya están en selectedSuppliers
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
    // 🚨 CAMBIO CLAVE: Llama al nuevo método sin paginar
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

  // Limpiar el select para forzar una nueva selección
  supplierToAddId.value = null
}

/**
 * Remueve un proveedor de la lista de seleccionados.
 */
const removeSupplier = (id: number) => {
  selectedSuppliers.value = selectedSuppliers.value.filter((s) => s.id !== id)
  emitSupplierIds()
}

const emitSupplierIds = () => {
  const ids = selectedSuppliers.value.map((s) => s.id)
  emit('update:supplier-ids', ids)
}

// --- WATCHERS y LÓGICA DE INICIALIZACIÓN ---

/**
 * Lógica de inicialización para el modo edición.
 * Carga los objetos Proveedor completos basados en los IDs iniciales.
 * (Solo necesario si allSuppliers no contiene toda la información)
 */
const initializeSelectedSuppliers = async (newIds: number[]) => {
  if (newIds && newIds.length > 0) {
    try {
      // Si ya tenemos la lista completa (allSuppliers), la usamos para evitar llamadas extra.
      if (allSuppliers.value.length > 0) {
        selectedSuppliers.value = allSuppliers.value.filter((s) => newIds.includes(s.id))
      } else {
        // Si allSuppliers está vacío (ej. cargó lento), hacemos llamadas individuales
        const suppliersPromises = newIds.map((id) =>
          proveedorService.getById(id).catch((e) => {
            console.error(`Fallo al cargar proveedor ID ${id}:`, e)
            return null
          }),
        )

        const suppliers = await Promise.all(suppliersPromises)
        selectedSuppliers.value = suppliers.filter((s): s is Proveedor => s !== null)
      }
    } catch (error) {
      console.error('Error al inicializar proveedores seleccionados:', error)
      selectedSuppliers.value = []
    }
  } else {
    selectedSuppliers.value = []
  }
  emitSupplierIds() // Emitir el estado inicial después de la carga
}

watch(
  () => props.initialSupplierIds,
  (newIds) => {
    // Si la lista de IDs cambia y la lista completa de opciones ya cargó, inicializamos
    if (allSuppliers.value.length > 0 || newIds.length > 0) {
      initializeSelectedSuppliers(newIds)
    }
  },
  { immediate: true },
)

// 🚨 Llama a la carga inicial de todas las opciones al montar el componente
onMounted(() => {
  loadAllSuppliers()

  // Si la carga inicial de opciones es exitosa, reinicializamos selectedSuppliers
  // por si el watcher se ejecutó antes de que 'allSuppliers' estuviera lleno.
  watch(
    allSuppliers,
    (newAllSuppliers) => {
      if (newAllSuppliers.length > 0) {
        initializeSelectedSuppliers(props.initialSupplierIds)
      }
    },
    { once: true },
  )
})
</script>

<style scoped>
/* No se requiere estilo de posicionamiento absoluto como antes */
</style>
