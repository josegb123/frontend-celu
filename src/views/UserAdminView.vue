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

        <div
          class="d-flex justify-content-center mt-3"
          v-if="paginatedUsers.meta && paginatedUsers.meta.total > 0"
        >
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
import type { IUser } from '@/interfaces/IUser'
import UserList from '../components/users/UserList.vue'
import UserForm from '@/components/users/UserForm.vue'
import NotificationModal from '@/components/utils/NotificationModal.vue'
import ConfirmationModal from '@/components/utils/ConfirmationModal.vue'
import { isAxiosError } from 'axios'

// --- ESTADO ---

const userToDelete = ref<IUser | null>(null)

/**
 * Estado y configuración del modal de confirmación.
 */
const confirmation = ref({
  visible: false,
  title: '',
  message: '',
  isProcessing: false,
})

/**
 * Datos paginados de usuarios obtenidos de la API.
 */
const paginatedUsers = ref<any>({
  data: [],
  links: {
    first: null,
    last: null,
    prev: null,
    next: null,
  },
  meta: {
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    links: [],
    path: '',
    per_page: 0,
    to: 0,
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
/**
 * Estado y contenido del modal de notificación.
 */
const notification = ref({
  visible: false,
  message: '',
  isError: false,
})

// --- CÁLCULOS ---

/**
 * Propiedad computada para generar los números de página visibles en la paginación.
 */
const visiblePages = computed(() => {
  const current = paginatedUsers.value.meta.current_page
  const last = paginatedUsers.value.meta.last_page
  const delta = 2

  if (last <= 1) return []

  if (last <= 5) {
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
 * Obtiene la lista de usuarios desde el backend, aplicando filtros y paginación.
 */
const fetchUsers = async () => {
  loading.value = true

  try {
    const response = await UserService.getUsers({
      page: currentPage.value || 1,
      search: searchQuery.value || null,
      role: selectedRole.value || null,
    })

    paginatedUsers.value = response
  } catch (error) {
    let message = 'Error al cargar los usuarios.'
    if (isAxiosError(error)) {
      console.error('API Error:', error.response)
      if (error.response?.status === 403 || error.response?.status === 401) {
        message = 'No tienes permiso para ver esta sección (Rol Admin requerido).'
      } else if (error.response?.data?.message) {
        message = error.response.data.message
      }
    } else {
      console.error('Unexpected Error:', error)
    }
    showNotification({ message, isError: true })

    // Limpiar lista en caso de error
    paginatedUsers.value = {
      data: [],
      links: {
        first: null,
        last: null,
        prev: null,
        next: null,
      },
      meta: {
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        links: [],
        path: '',
        per_page: 0,
        to: 0,
      },
    }
  } finally {
    loading.value = false
  }
}

/**
 * Navega a una página específica de la lista.
 * @param page El número de página a la que navegar.
 */
const goToPage = (page: number) => {
  if (page >= 1 && page <= paginatedUsers.value.meta.last_page) {
    currentPage.value = page
  }
}

// --- MÉTODOS DEL MODAL ---

/**
 * Abre el modal en modo creación.
 */
const openCreateModal = () => {
  userToEdit.value = null
  modalVisible.value = true
}

/**
 * Prepara y abre el modal en modo edición.
 * @param user El objeto de usuario a editar.
 */
const startEditingUser = (user: IUser) => {
  userToEdit.value = user
  modalVisible.value = true
}

/**
 * Cierra el modal de formulario.
 */
const closeModal = () => {
  modalVisible.value = false
  userToEdit.value = null
}

/**
 * Maneja el evento después de que un usuario es guardado o falla al guardar.
 * @param success Indica si la operación fue exitosa.
 * @param message Mensaje de resultado de la operación.
 */
const handleUserSaved = (success: boolean, message: string) => {
  closeModal()
  showNotification({ message, isError: !success })

  if (success) {
    // Recargar la lista para mostrar el nuevo/editado usuario
    fetchUsers()
  }
}

// --- MÉTODOS DE CONFIRMACIÓN ---

/**
 * Abre el modal de confirmación para eliminar un usuario.
 * @param user El objeto de usuario a eliminar.
 */
const openConfirmationModal = (user: IUser) => {
  userToDelete.value = user
  confirmation.value = {
    visible: true,
    title: 'Eliminar Usuario',
    message: `¿Estás seguro de que deseas eliminar permanentemente a "${user.name}"?`,
    isProcessing: false,
  }
}

/**
 * Cierra el modal de confirmación.
 */
const closeConfirmationModal = () => {
  confirmation.value.visible = false
  userToDelete.value = null
}

/**
 * Ejecuta la eliminación del usuario tras la confirmación.
 */
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
    showNotification({
      message:
        'Error al eliminar el usuario. Revisa los permisos o si hay registros asociados.' + error,
      isError: true,
    })
    closeConfirmationModal()
  } finally {
    confirmation.value.isProcessing = false
  }
}

// --- HANDLERS DE NOTIFICACIONES ---

/**
 * Muestra el modal de notificación con un mensaje dado.
 * @param result Objeto con el mensaje y el estado de error.
 */
const showNotification = (result: { message: string; isError: boolean }) => {
  notification.value = {
    visible: true,
    message: result.message,
    isError: result.isError,
  }
}

/**
 * Cierra el modal de notificación.
 */
const closeNotification = () => {
  notification.value = { visible: false, message: '', isError: false }
}

// --- WATCHERS y CICLO DE VIDA ---

/**
 * Observa cambios en la página actual o filtros (búsqueda/rol) para recargar la lista.
 */
watch(
  [currentPage, searchQuery, selectedRole],
  ([, newSearch, newRole], [, oldSearch, oldRole]) => {
    // Si la búsqueda o el rol cambian, forzamos la página a 1 para empezar la búsqueda.
    if (newSearch !== oldSearch || newRole !== oldRole) {
      if (currentPage.value !== 1) {
        currentPage.value = 1
        return
      }
    }
    // Cargar usuarios si la página cambió o si los filtros cambiaron estando en la página 1.
    fetchUsers()
  },
)

onMounted(() => {
  fetchUsers()
  if (!fetchUsers()) {
    showNotification({ message: 'Error al cargar los usuarios.', isError: true })
  }
})
</script>
