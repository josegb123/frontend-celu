<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DevolucionService, { type Devolucion } from '@/services/DevolucionService'
import { useNotification } from '@/composables/useNotification'

const { showNotification } = useNotification()

const devolucionesPendientes = ref<Devolucion[]>([])
const loading = ref(true)
const updatingStatus = ref<number | null>(null) // To track which item is being updated

const fetchDevolucionesPendientes = async () => {
  loading.value = true
  try {
    devolucionesPendientes.value = await DevolucionService.getDevolucionesPendientes()
  } catch (err) {
    console.error('Error fetching devoluciones pendientes:', err)
    showNotification('Error al cargar devoluciones pendientes', 'error')
  } finally {
    loading.value = false
  }
}

const updateStatus = async (id: number, newStatus: string) => {
  updatingStatus.value = id
  try {
    await DevolucionService.updateDevolucionStatus(id, newStatus)
    showNotification(`Estado de devolución ${id} actualizado a "${newStatus}"`, 'success')
    // Re-fetch data to reflect the change
    await fetchDevolucionesPendientes()
  } catch (err) {
    // Handle error
    console.error(`Error updating status for devolucion ${id}:`, err)
    showNotification(`Error al actualizar estado de devolución ${id}`, 'error')
  } finally {
    updatingStatus.value = null
  }
}

onMounted(fetchDevolucionesPendientes)
</script>

<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Gestión de Devoluciones Pendientes</h2>
      <p class="text-muted mb-0">Revisión y gestión de productos devueltos pendientes.</p>
    </div>

    <div class="card p-4">
      <div class="row">
        <div class="col-3">
          <router-link :to="{ name: 'DevolucionForm' }" class="btn btn-primary mb-3 w-100">
            <i class="bi bi-plus-lg me-2"></i> Nueva Devolución
          </router-link>
        </div>
      </div>
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">Cargando devoluciones pendientes...</p>
      </div>
      <div v-else-if="devolucionesPendientes.length === 0" class="alert alert-info text-center">
        No hay devoluciones pendientes para gestionar.
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover table-striped">
          <thead>
            <tr>
              <th>Producto</th>
              <th>ID Único</th>
              <th>Cliente</th>
              <th>Motivo</th>
              <th>Costo Unitario</th>
              <th>Estado Gestión</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dev in devolucionesPendientes" :key="dev.id">
              <td>{{ dev.producto?.nombre ?? 'N/A' }}</td>
              <td>{{ dev.id_unico_producto }}</td>
              <td>
                {{ dev.cliente?.nombre ?? 'N/A' }} ({{
                  dev.cliente?.cedula ?? 'Sin Identificación'
                }})
              </td>
              <td>{{ dev.motivo }}</td>
              <td>${{ dev.costo_unitario || 0 }}</td>
              <td>{{ dev.estado_gestion }}</td>

              <td>
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-warning dropdown-toggle"
                    type="button"
                    :id="`dropdownMenuButton-${dev.id}`"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    data-boundary="viewport"
                  >
                    Acciones
                  </button>
                  <ul class="dropdown-menu" :aria-labelledby="`dropdownMenuButton-${dev.id}`">
                    <li>
                      <button
                        class="dropdown-item"
                        :disabled="updatingStatus === dev.id"
                        @click="updateStatus(dev.id, 'Contactado')"
                      >
                        Contactar Proveedor
                      </button>
                    </li>
                    <li>
                      <button
                        class="dropdown-item"
                        :disabled="updatingStatus === dev.id"
                        @click="updateStatus(dev.id, 'Finalizada')"
                      >
                        Finalizar (Pérdida/Descarte)
                      </button>
                    </li>
                    <!-- Add more actions if needed -->
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-responsive {
  min-height: 70vh;
}

.table-responsive,
.table {
  overflow-y: visible !important;
}
</style>
