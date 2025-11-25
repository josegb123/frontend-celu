<template>
  <div class="table-responsive">
    <table class="table table-hover align-middle">
      <thead>
        <tr>
          <th scope="col"># ID</th>
          <th scope="col">Nombre</th>
          <th scope="col">Email</th>
          <th scope="col">Rol</th>
          <th scope="col">Creado en</th>
          <th scope="col">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="6" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando usuarios, por favor espere...</p>
          </td>
        </tr>

        <tr v-else v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span :class="roleBadgeClass(user.role)">
              {{ formatRole(user.role) }}
            </span>
          </td>
          <td>{{ formatDate(user.created_at) }}</td>
          <td>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-info" @click="$emit('edit', user)">
                <i class="bi bi-pencil"></i> Editar
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', user)">
                <i class="bi bi-trash"></i> Eliminar
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="!loading && users.length === 0">
          <td colspan="6" class="text-center py-5 text-muted">
            <i class="bi bi-people-fill display-4 d-block"></i>
            <p class="mt-2">
              No se encontraron usuarios que coincidan con los criterios de búsqueda.
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

// src/components/users/UserList.vue

<script setup lang="ts">
import type { IUser } from '@/interfaces/IUser'
import { defineProps, defineEmits } from 'vue'

// --- PROPIEDADES y EMITS ---

const props = defineProps<{
  users: IUser[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', user: IUser): void
  (e: 'delete', user: IUser): void
}>()

// --- MÉTODOS DE FORMATO ---

/**
 * Devuelve la clase de badge de Bootstrap según el rol.
 */
const roleBadgeClass = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'badge bg-primary'
    case 'seller':
      return 'badge bg-success'
    case 'editor':
      return 'badge bg-secondary'
    default:
      return 'badge bg-light text-dark'
  }
}

/**
 * Formatea el nombre del rol para que sea más legible.
 */
const formatRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

/**
 * Formatea una fecha de ISO 8601 (o similar) a un formato legible.
 */
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  // Usamos la API nativa de JavaScript para una mejor localización
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
