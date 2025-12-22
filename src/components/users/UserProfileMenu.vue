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
      <span
        v-if="totalNotificaciones > 0"
        class="position-absolute top-0 start-80 translate-middle badge rounded-pill bg-danger"
      >
        {{ totalNotificaciones > 99 ? '99+' : totalNotificaciones }}
      </span>
    </a>

    <Teleport to="#teleported-layer" v-if="isMenuOpen">
      <ul
        class="dropdown-menu border rounded shadow-lg show"
        :style="menuPositionStyle"
        ref="dropdownMenuRef"
        aria-labelledby="userDropdownAnchor"
      >
        <li class="dropdown-header">
          <span class="d-block fw-bold fs-6 text-truncate text-primary">
            {{ user.name || 'Usuario' }}
          </span>
          <small class="text-muted text-truncate d-block">{{ user.email }}</small>
        </li>
        <li><hr class="dropdown-divider" /></li>
        <li>
          <a class="dropdown-item" href="#" @click.prevent="goToRoute('notificaciones')">
            <i class="bi bi-bell-fill me-2 text-warning"></i>Notificaciones
            <span v-if="totalNotificaciones > 0" class="badge rounded-pill bg-danger">
              {{ totalNotificaciones > 99 ? '99+' : totalNotificaciones }}
            </span>
          </a>
        </li>
        <li v-if="cajaStore.isCajaAbierta">
          <a class="dropdown-item text-danger fw-bold" href="#" @click.prevent="handleCierreManual">
            <i class="bi bi-cash-coin me-2"></i>Cerrar Caja Diaria
          </a>
        </li>
        <li><hr class="dropdown-divider" /></li>
        <li>
          <a class="dropdown-item" href="#" @click.prevent="goToRoute('Config')">
            <i class="bi bi-gear-fill me-2 text-secondary"></i>Configuración
          </a>
        </li>
        <li><hr class="dropdown-divider" /></li>
        <li>
          <a
            class="dropdown-item text-danger"
            href="#"
            :class="{ disabled: authStore.isLoading }"
            @click.prevent="handleLogout"
          >
            <i v-if="!authStore.isLoading" class="bi bi-box-arrow-right me-2"></i>
            <span v-else class="spinner-border spinner-border-sm me-2"></span>
            <strong>{{ authStore.isLoading ? 'Saliendo...' : 'Cerrar Sesión' }}</strong>
          </a>
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted, nextTick, type CSSProperties } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useCajaStore } from '@/store/useCajaStore'
import { useStockStore } from '@/store/useStockAlertStore'
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/vue'

const emit = defineEmits(['showCierreModal'])
const router = useRouter()
const authStore = useAuthStore()
const cajaStore = useCajaStore()
const stockStore = useStockStore()

const defaultAvatar = '/avatar.webp'
const user = computed(() => authStore.user)
const totalNotificaciones = computed(() => stockStore.badgeCount)

const isMenuOpen = ref(false)
const isPositioned = ref(false) // Control para evitar el salto visual
const dropdownAnchorRef = ref<HTMLElement | null>(null)
const dropdownMenuRef = ref<HTMLElement | null>(null)

// autoUpdate asegura que si haces scroll o cambias el tamaño, el menú siga al botón
const { floatingStyles, update } = useFloating(dropdownAnchorRef, dropdownMenuRef, {
  placement: 'bottom-end',
  whileElementsMounted: autoUpdate,
  middleware: [offset(8), flip(), shift()],
})

/**
 * CORRECCIÓN DE ERROR DE TIPADO:
 * Definimos el retorno como CSSProperties para que TS acepte 'visibility'
 */
const menuPositionStyle = computed(
  (): CSSProperties => ({
    ...floatingStyles.value,
    zIndex: 9999,
    opacity: isPositioned.value ? 1 : 0,
    visibility: (isPositioned.value ? 'visible' : 'hidden') as CSSProperties['visibility'],
    transition: 'opacity 0.15s ease-out',
  }),
)

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as Node
  if (!dropdownAnchorRef.value?.contains(target) && !dropdownMenuRef.value?.contains(target)) {
    isMenuOpen.value = false
  }
}

watch(isMenuOpen, async (isOpen) => {
  if (isOpen) {
    isPositioned.value = false // Ocultar mientras se calcula
    await nextTick()
    await update()
    isPositioned.value = true // Mostrar ya posicionado
    document.addEventListener('click', handleOutsideClick)
  } else {
    document.removeEventListener('click', handleOutsideClick)
  }
})

const goToRoute = async (routeName: string) => {
  isMenuOpen.value = false
  await nextTick()
  router.push({ name: routeName })
}

const handleCierreManual = () => {
  isMenuOpen.value = false
  emit('showCierreModal')
}

const handleLogout = async () => {
  if (authStore.isLoading) return
  isMenuOpen.value = false
  await nextTick()
  const loggedOut = await authStore.logout()
  if (loggedOut) router.push({ name: 'auth' })
  else emit('showCierreModal')
}

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style lang="scss" scoped>
/* Elimina la flecha/caret en todos los estados */
.dropdown-toggle::after {
  display: none !important;
  content: none !important;
  border: none !important;
}

/* Opcional: Si Bootstrap añade un margen a la derecha del texto por el toggle */
.dropdown-toggle {
  padding-right: 0.5rem; /* Ajusta según prefieras el espaciado del avatar */
}

.profile-avatar {
  object-fit: cover;
  transition: transform 0.2s ease;
}

.profile-avatar:hover {
  transform: scale(1.3);
}
</style>
