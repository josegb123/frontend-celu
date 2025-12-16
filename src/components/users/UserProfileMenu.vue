<template>
  <div class="user-menu dropdown">
    <a
      class="d-flex align-items-center text-decoration-none dropdown-toggle px-2 py-1 rounded-pill position-relative"
      href="#"
      role="button"
      id="userDropdownAnchor"
      @click.prevent="isMenuOpen = !isMenuOpen"
      ref="dropdownAnchorRef"
    >
      <img
        :src="defaultAvatar"
        alt="Avatar"
        class="rounded-circle profile-avatar border border-2 border-primary"
        width="28px"
        height="28px"
      />

      <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {{ totalNotificaciones > 99 ? '99+' : totalNotificaciones || '' }}
      </span>
    </a>

    <Teleport to="#teleported-layer">
      <ul
        v-if="isMenuOpen"
        class="dropdown-menu dropdown-menu-end border rounded shadow-lg"
        :class="{ show: isMenuOpen }"
        :style="menuPositionStyle"
        ref="dropdownMenuRef"
        aria-labelledby="userDropdownAnchor"
      >
        <li class="dropdown-header">
          <span class="d-block fw-bold fs-6 text-truncate text-primary">{{
            user.name || 'Usuario'
          }}</span>
          <small class="text-muted text-truncate" :title="user.email ?? undefined">{{
            user.email
          }}</small>
        </li>
        <li>
          <hr class="dropdown-divider" />
        </li>

        <li>
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
          <a class="dropdown-item" href="#" @click.prevent="goToRoute('Config')">
            <i class="bi bi-gear-fill me-2 text-secondary"></i>Configuración
          </a>
        </li>

        <li>
          <hr class="dropdown-divider" />
        </li>

        <li>
          <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
            <i class="bi bi-box-arrow-right me-2"></i><strong>Cerrar Sesión</strong>
          </a>
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useCajaStore } from '@/store/useCajaStore'
import { useStockAlertStore } from '@/store/useStockAlertStore'
import { useFloating, offset, flip } from '@floating-ui/vue'

// Definir los eventos que este componente puede emitir
const emit = defineEmits(['showCierreModal'])

const router = useRouter()
const authStore = useAuthStore()
const cajaStore = useCajaStore()
const stockStore = useStockAlertStore()

const defaultAvatar = '/avatar.webp'

/** Datos del usuario (reactivos desde Pinia) */
const user = computed(() => authStore.user)

/** Cálculo del total de notificaciones */
const totalNotificaciones = computed(() => {
  return stockStore.totalNotificaciones
})

// --- Lógica de Teleport y Floating UI ---
const isMenuOpen = ref(false)
const dropdownAnchorRef = ref<HTMLElement | null>(null) // El botón/avatar
const dropdownMenuRef = ref<HTMLElement | null>(null) // El menú <ul> (teletransportado)

// Configuración de Floating UI para calcular la posición
const { floatingStyles, update } = useFloating(dropdownAnchorRef, dropdownMenuRef, {
  // Cuando el sidebar está colapsado, queremos que el menú aparezca a la DERECHA del ícono.
  placement: 'right-start',
  middleware: [
    offset(5), // 5px de separación
    flip(), // Permite que el menú se voltee si no cabe
  ],
})

// Estilos dinámicos para el menú
const menuPositionStyle = computed(() => ({
  // Floating UI provee 'top', 'left' y 'position: absolute'
  ...floatingStyles.value,
  zIndex: '9999', // Asegura que esté por encima de cualquier otro elemento
}))

// Lógica para cerrar al hacer clic fuera
const handleOutsideClick = (event: MouseEvent) => {
  if (!isMenuOpen.value) return

  const target = event.target as Node
  const isAnchor = dropdownAnchorRef.value?.contains(target)
  const isMenu = dropdownMenuRef.value?.contains(target)
  if (!isAnchor && !isMenu) {
    isMenuOpen.value = false
  }
}

// Observar el cambio de isMenuOpen para actualizar la posición
watch(isMenuOpen, (isOpen) => {
  if (isOpen) {
    // Esperar un tick para que el menú se renderice en el DOM antes de calcular la posición
    nextTick(() => {
      update()
    })
    document.addEventListener('click', handleOutsideClick)
  } else {
    document.removeEventListener('click', handleOutsideClick)
  }
})
// --- FIN Lógica de Teleport y Floating UI ---

/**
 * Maneja la navegación a otras rutas.
 * @param routeName - Nombre de la ruta a navegar.
 */
const goToRoute = (routeName: string) => {
  isMenuOpen.value = false // Cierra el menú al navegar
  router.push({ name: routeName })
}

/** Maneja el cierre de caja manual */
const handleCierreManual = () => {
  isMenuOpen.value = false // Cierra el menú
  if (cajaStore.isCajaAbierta) {
    emit('showCierreModal')
  }
}

/** Maneja el cierre de sesión */
const handleLogout = async () => {
  isMenuOpen.value = false // Cierra el menú
  const loggedOut = await authStore.logout()

  if (!loggedOut) {
    emit('showCierreModal')
    return
  }

  router.push({ name: 'auth' })
}

onMounted(() => {
  stockStore.fetchBajoStock()
})

onUnmounted(() => {
  // Limpiar el listener por si acaso
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.profile-avatar {
  object-fit: cover;
}

/* Se mantiene para eliminar el caret de Bootstrap, aunque ya no se usa data-bs-toggle */
.dropdown-toggle::after {
  display: none;
}

.dropdown-item {
  cursor: pointer;
}

.user-menu .dropdown-toggle {
  /* Asegurar que el ancla tenga un z-index alto en su posición original */
  position: relative;
  z-index: 800;
}
</style>
