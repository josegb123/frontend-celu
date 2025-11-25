<template>
  <div class="user-menu dropdown">
    <a
      class="d-flex align-items-center text-decoration-none dropdown-toggle"
      href="#"
      role="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      id="userDropdown"
    >
      <img
        :src="defaultAvatar"
        alt="Avatar"
        class="rounded-circle profile-avatar me-2"
        width="10%"
        height="10%"
      />
      <span class="d-none d-sm-inline text-dark fw-semibold">{{ user.name || 'Usuario' }}</span>
    </a>

    <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
      <li class="dropdown-header">
        <span class="d-block fw-bold">{{ user.name || 'Usuario' }}</span>
        <small class="text-muted">{{ user.email }}</small>
      </li>
      <li>
        <hr class="dropdown-divider" />
      </li>

      <li>
        <a class="dropdown-item" href="#" @click.prevent="goToRoute('Profile')">
          <i class="bi bi-person-circle me-2"></i>Mi Perfil
        </a>
      </li>

      <li>
        <a class="dropdown-item" href="#" @click.prevent="goToRoute('Settings')">
          <i class="bi bi-gear-fill me-2"></i>Configuración
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

const router = useRouter()
const authStore = useAuthStore()
const defaultAvatar = '/path/to/default/avatar.png' // ⬅️ Reemplaza con tu placeholder real

// Datos del usuario (reactivos desde Pinia)
const user = computed(() => authStore.user)

// Manejar navegación a otras rutas
const goToRoute = (routeName: string) => {
  // Implementa la lógica de enrutamiento aquí.
  // Necesitarás definir estas rutas en tu router/index.ts.
  router.push({ name: routeName })
}

// Manejar el cierre de sesión
const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'auth' })
}
</script>

<style scoped>
.profile-avatar {
  object-fit: cover;
  border: 2px solid #0d6efd;
  /* Borde primario sutil */
}

.dropdown-toggle::after {
  /* Estilo para quitar o modificar el caret de Bootstrap */
  display: none;
}

.dropdown-item {
  cursor: pointer;
}
</style>
