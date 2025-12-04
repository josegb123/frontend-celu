<template>
  <div class="user-menu dropdown">
    <a
      class="d-flex align-items-center text-decoration-none dropdown-toggle px-2 py-1 rounded-pill position-relative"
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

      <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {{ totalNotificaciones > 99 ? '99+' : totalNotificaciones }}
      </span>
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

      <li :class="{ 'bg-light': totalNotificaciones > 0 }">
        <a class="dropdown-item" href="#" @click.prevent="goToRoute('notificaciones')">
          <i class="bi bi-bell-fill me-2 text-warning"></i>Notificaciones
          <span v-if="totalNotificaciones > 0" class="badge rounded-pill bg-danger">
            {{ totalNotificaciones }}
          </span>
        </a>
      </li>

      <li v-if="totalNotificaciones > 0 || cajaStore.isCajaAbierta">
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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useCajaStore } from '@/store/useCajaStore'
import { useStockAlertStore } from '@/store/useStockAlertStore'

// Definir los eventos que este componente puede emitir
const emit = defineEmits(['showCierreModal'])

const router = useRouter()
const authStore = useAuthStore()
const cajaStore = useCajaStore()
const stockStore = useStockAlertStore()

const defaultAvatar = '/public/avatar.webp'

/** Datos del usuario (reactivos desde Pinia) */
const user = computed(() => authStore.user)

/** Cálculo del total de notificaciones */
const totalNotificaciones = computed(() => {
  // Aquí puedes sumar otras fuentes de notificaciones (ej: morosos)
  return stockStore.totalNotificaciones
})

/**
 * Maneja la navegación a otras rutas.
 * @param routeName - Nombre de la ruta a navegar.
 */
const goToRoute = (routeName: string) => {
  router.push({ name: routeName })
}

/** Maneja el cierre de caja manual */
const handleCierreManual = () => {
  if (cajaStore.isCajaAbierta) {
    emit('showCierreModal')
  }
}

/** Maneja el cierre de sesión */
const handleLogout = async () => {
  const loggedOut = await authStore.logout()

  if (!loggedOut) {
    emit('showCierreModal')
    return
  }

  router.push({ name: 'auth' })
}

onMounted(() => {
  stockStore.fetchBajoStock(1)
})
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

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.65rem;
  padding: 0.15rem 0.35rem;
  /* Ajuste fino de posición */
  transform: translate(25%, -25%);
  z-index: 2000;
}

.user-menu .dropdown-toggle {
  /* El contenedor <a> debe ser relativo para el absolute del badge */
  position: relative;
}
</style>
