<script setup lang="ts">
// Define la interfaz Proveedor para tipado (idealmente importada de un archivo de tipos)
interface Proveedor {
  id: number
  nombreComercial: string
  nombreContacto: string | null
  identificacion: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  ciudad: string | null
  notas: string | null
  activo: boolean
}

// 1. Definición de Props: Recibe la lista de proveedores
const props = defineProps<{
  proveedores: Proveedor[]
}>()

// 2. Definición de Emits: Eventos que envían el proveedor/id para la acción
const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="table-responsive card shadow-lg">
    <table class="table table-hover mb-0">
      <thead class="table-light">
        <tr>
          <th scope="col">Compañía</th>
          <th scope="col" class="d-none d-sm-table-cell">Contacto</th>
          <th scope="col" class="d-none d-md-table-cell">Email / Teléfono</th>
          <th scope="col" class="text-center d-none d-md-table-cell">Estado</th>
          <th scope="col" class="text-end">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="proveedor in proveedores" :key="proveedor.id">
          <td>
            <div class="fw-bold">{{ proveedor.nombreComercial }}</div>
            <small class="text-muted">{{ proveedor.identificacion || 'N/A' }}</small>
          </td>
          <td class="d-none d-sm-table-cell">
            <div>{{ proveedor.nombreContacto || 'N/A' }}</div>
            <small class="text-muted">{{ proveedor.ciudad || 'Sin Ciudad' }}</small>
          </td>
          <td class="d-none d-md-table-cell">
            <p class="mb-0">{{ proveedor.email || 'Sin email' }}</p>
            <small class="text-muted">{{ proveedor.telefono || 'Sin teléfono' }}</small>
          </td>
          <td class="text-center d-none d-md-table-cell">
            <span :class="['badge', proveedor.activo ? 'bg-success' : 'bg-danger']">
              {{ proveedor.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td class="text-end text-nowrap">
            <button
              @click="emit('edit', proveedor)"
              class="btn btn-sm btn-info text-white me-2"
              title="Editar"
            >
              <i class="bi bi-pencil"></i> <span class="d-none d-lg-inline">Editar</span>
            </button>
            <button
              @click="emit('delete', proveedor.id)"
              class="btn btn-sm btn-danger"
              title="Eliminar"
            >
              <i class="bi bi-trash"></i> <span class="d-none d-lg-inline">Eliminar</span>
            </button>
          </td>
        </tr>
        <tr v-if="proveedores.length === 0">
          <td colspan="5" class="text-center py-4 text-muted">
            No se encontraron proveedores que coincidan con la búsqueda.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
