<template>
  <div class="container-fluid py-4">
    <h1 class="mb-4">Gestión de Usuarios 🧑‍💼</h1>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="d-flex mb-4 gap-3 align-items-end">
          <div class="flex-shrink-0">
            <button class="btn btn-primary" @click="openCreateModal">
              <i class="bi bi-plus-lg"></i> Crear nuevo
            </button>
          </div>

          <div class="flex-grow-1">
            <label for="search" class="form-label">Buscar usuario</label>
            <input
              type="text"
              id="search"
              class="form-control"
              placeholder="Nombre o Email"
              v-model="searchQuery"
            />
          </div>

          <div class="flex-shrink-0" style="width: 200px">
            <label for="roleFilter" class="form-label">Tipo usuario</label>
            <select id="roleFilter" class="form-select" v-model="selectedRole">
              <option value="">Todos los Roles</option>
              <option value="admin">Administrador</option>
              <option value="seller">Vendedor</option>
              <option value="editor">Editor</option>
            </select>
          </div>
        </div>

        <UserList
          :users="paginatedUsers.data"
          :loading="loading"
          @edit="startEditingUser"
          @delete="openConfirmationModal"
        />

        <div class="d-flex justify-content-center mt-3" v-if="paginatedUsers.meta.total > 0">
          <nav>
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: paginatedUsers.meta.current_page === 1 }">
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="goToPage(paginatedUsers.meta.current_page - 1)"
                  >Anterior</a
                >
              </li>

              <li
                class="page-item"
                v-for="page in visiblePages"
                :key="page"
                :class="{ active: page === paginatedUsers.meta.current_page }"
              >
                <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
              </li>

              <li
                class="page-item"
                :class="{
                  disabled: paginatedUsers.meta.current_page === paginatedUsers.meta.last_page,
                }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="goToPage(paginatedUsers.meta.current_page + 1)"
                  >Siguiente</a
                >
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    :class="{ 'show d-block': modalVisible }"
    tabindex="-1"
    aria-hidden="true"
    v-if="modalVisible"
    style="background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ userToEdit ? 'Editar Usuario' : 'Crear Usuario' }}</h5>
          <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <UserForm :user-to-edit="userToEdit" @user-saved="handleUserSaved" @close="closeModal" />
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade" :class="{ show: modalVisible }" v-if="modalVisible"></div>

  <NotificationModal
    :isVisible="notification.visible"
    :message="notification.message"
    :isError="notification.isError"
    @close="closeNotification"
  />

  <ConfirmationModal
    :isVisible="confirmation.visible"
    :title="confirmation.title"
    :message="confirmation.message"
    :confirm-text="'Sí, Eliminar'"
    :is-processing="confirmation.isProcessing"
    @confirm="deleteUserConfirmed"
    @cancel="closeConfirmationModal"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import UserService from '@/services/UserService'
import type { IUser, IPaginatedUsers } from '@/interfaces/IUser'
// Componentes
import UserList from '../components/users/UserList.vue' // Asegúrate de que la ruta sea correcta
import UserForm from '@/components/users/UserForm.vue'
import NotificationModal from '@/components/NotificationModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue' // El modal de confirmación
import { isAxiosError } from 'axios'

// --- ESTADO ---

const userToDelete = ref<IUser | null>(null)
const confirmation = ref({
  visible: false,
  title: '',
  message: '',
  isProcessing: false,
})

const paginatedUsers = ref<IPaginatedUsers>({
  data: [],
  links: {},
  meta: {
    current_page: 1,
    last_page: 1,
    total: 0,
  },
})

const loading = ref(false)
const currentPage = ref(1)

// Filtros
const searchQuery = ref('')
const selectedRole = ref('')

// Modal y Edición
const modalVisible = ref(false)
const userToEdit = ref<IUser | null>(null)

// Notificaciones
const notification = ref({
  visible: false,
  message: '',
  isError: false,
})

// --- CÁLCULOS ---

/**
 * Propiedad computada para generar los números de página visibles
 */
const visiblePages = computed(() => {
  const current = paginatedUsers.value.meta.current_page
  const last = paginatedUsers.value.meta.last_page
  const delta = 2 // Mostrar 2 páginas antes y 2 después

  if (last <= 1) return [] // No mostrar paginación si solo hay una página o menos

  if (last <= 5) {
    // Si hay 5 o menos páginas, mostrar todas
    return Array.from({ length: last }, (_, i) => i + 1)
  }

  let start = current - delta
  let end = current + delta

  if (start < 1) {
    end += 1 - start
    start = 1
  }

  if (end > last) {
    start -= end - last
    end = last
  }

  start = Math.max(1, start)

  const pages: number[] = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// --- MÉTODOS CRUD y FETCH ---

/**
 * Obtiene la lista de usuarios desde el backend.
 */
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await UserService.getUsers(currentPage.value)
    // 💥 CORREGIDO: response ya tiene la estructura {data, links, meta} 💥
    paginatedUsers.value = response
  } catch (error) {
    console.error('Error fetching users:', error)
    let message = 'Error al cargar los usuarios.'
    if (isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 401)) {
      message = 'No tienes permiso para ver esta sección (Rol Admin requerido).'
    }
    showNotification({ message, isError: true })
    paginatedUsers.value = {
      data: [],
      links: {},
      meta: { current_page: 1, last_page: 1, total: 0 },
    }
  } finally {
    loading.value = false
  }
}

/**
 * Navega a una página específica de la lista.
 */
const goToPage = (page: number) => {
  if (page >= 1 && page <= paginatedUsers.value.meta.last_page) {
    currentPage.value = page
  }
}

// --- MÉTODOS DEL MODAL ---

const openCreateModal = () => {
  userToEdit.value = null
  modalVisible.value = true
}

const startEditingUser = (user: IUser) => {
  userToEdit.value = user
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
  userToEdit.value = null
}

const handleUserSaved = (success: boolean, message: string) => {
  closeModal()
  showNotification({ message, isError: !success })

  if (success) {
    fetchUsers()
  }
}

// --- MÉTODOS DE CONFIRMACIÓN ---

const openConfirmationModal = (user: IUser) => {
  userToDelete.value = user
  confirmation.value = {
    visible: true,
    title: 'Eliminar Usuario',
    message: `¿Estás seguro de que deseas eliminar permanentemente a "${user.name}"?`,
    isProcessing: false,
  }
}

const closeConfirmationModal = () => {
  confirmation.value.visible = false
  userToDelete.value = null
}

const deleteUserConfirmed = async () => {
  if (!userToDelete.value) return

  confirmation.value.isProcessing = true
  const user = userToDelete.value

  try {
    await UserService.deleteUser(user.id)
    showNotification({ message: `Usuario "${user.name}" eliminado exitosamente.`, isError: false })
    fetchUsers()
    closeConfirmationModal()
  } catch (error) {
    console.error('Error deleting user:', error)
    showNotification({
      message: 'Error al eliminar el usuario. Revisa los permisos.',
      isError: true,
    })
    closeConfirmationModal()
  } finally {
    confirmation.value.isProcessing = false
  }
}

// --- HANDLERS DE NOTIFICACIONES ---

const showNotification = (result: { message: string; isError: boolean }) => {
  notification.value = {
    visible: true,
    message: result.message,
    isError: result.isError,
  }
}

const closeNotification = () => {
  notification.value = { visible: false, message: '', isError: false }
}

// --- WATCHERS y CICLO DE VIDA ---

// Observa cambios en la página actual o filtros para recargar la lista
watch(
  [currentPage, searchQuery, selectedRole],
  ([newPage, newSearch, newRole], [oldPage, oldSearch, oldRole]) => {
    // Reiniciar la página a 1 si los filtros cambiaron.
    if (newSearch !== oldSearch || newRole !== oldRole) {
      if (currentPage.value !== 1) {
        currentPage.value = 1
        return // El cambio a 1 disparará el watcher de nuevo
      }
    }

    // Si solo la página cambió, o si ya estamos en la página 1 con filtros nuevos, cargamos:
    fetchUsers()
  },
)

onMounted(() => {
  fetchUsers()
})
</script>
