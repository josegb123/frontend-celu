<template>
  <div class="user-menu dropdown">
    <a
      class="d-flex align-items-center text-decoration-none dropdown-toggle px-2 py-1 rounded-pill"
      href="#"
      role="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      id="userDropdown"
    >
      <img
        :src="defaultAvatar"
        alt="Avatar"
        class="rounded-circle profile-avatar border border-2 border-primary"
        width="28px"
        height="28px"
      />
    </a>

    <ul class="dropdown-menu dropdown-menu-end shadow-lg" aria-labelledby="userDropdown">
      <li class="dropdown-header">
        <span class="d-block fw-bold fs-6 text-truncate">{{ user.name || 'Usuario' }}</span>
        <small class="text-muted text-truncate" :title="user.email ?? undefined">{{
          user.email
        }}</small>
      </li>
      <li>
        <hr class="dropdown-divider" />
      </li>

      <li v-if="cajaStore.isCajaAbierta">
        <a class="dropdown-item text-danger fw-bold" href="#" @click.prevent="handleCierreManual">
          <i class="bi bi-cash-coin me-2"></i>Cerrar Caja Diaria
        </a>
      </li>
      <li v-if="cajaStore.isCajaAbierta">
        <hr class="dropdown-divider" />
      </li>
      <li>
        <a class="dropdown-item" href="#" @click.prevent="goToRoute('Profile')">
          <i class="bi bi-person-circle me-2 text-primary"></i>Mi Perfil
        </a>
      </li>

      <li>
        <a class="dropdown-item" href="#" @click.prevent="goToRoute('Settings')">
          <i class="bi bi-gear-fill me-2 text-secondary"></i>Configuración
        </a>
      </li>

      <li>
        <hr class="dropdown-divider" />
      </li>

      <li>
        <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
          <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useCajaStore } from '@/store/useCajaStore' // NUEVA IMPORTACIÓN

// Definir los eventos que este componente puede emitir
const emit = defineEmits(['showCierreModal'])

const router = useRouter()
const authStore = useAuthStore()
const cajaStore = useCajaStore() // Inicialización del store de Caja
const defaultAvatar = '/public/avatar.webp'

/** Datos del usuario (reactivos desde Pinia) */
const user = computed(() => authStore.user)

/**
 * Maneja la navegación a otras rutas.
 * @param routeName - Nombre de la ruta a navegar.
 */
const goToRoute = (routeName: string) => {
  router.push({ name: routeName })
}

/** Maneja el cierre de caja manual */
const handleCierreManual = () => {
  // Si hay caja abierta, emitimos el evento para mostrar el modal global
  if (cajaStore.isCajaAbierta) {
    emit('showCierreModal')
    // Opcional: Cerrar el dropdown programáticamente si es posible o necesario
  }
}

/** Maneja el cierre de sesión */
const handleLogout = async () => {
  const loggedOut = await authStore.logout() // Recibir el resultado del store

  if (!loggedOut) {
    // Si el logout fue bloqueado por la caja (devuelve false), mostramos el modal.
    emit('showCierreModal')
    return
  }

  // Si el logout fue exitoso (devuelve true), navegamos.
  router.push({ name: 'auth' })
}
</script>

<style scoped>
.profile-avatar {
  object-fit: cover;
}

/* Se mantiene para eliminar el caret de Bootstrap */
.dropdown-toggle::after {
  display: none;
}

.dropdown-item {
  cursor: pointer;
}
</style>
