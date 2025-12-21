<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-lg-8 mx-auto">
        <h2 class="mb-4 text-center">⚙️ Configuración del Sistema</h2>

        <div class="card shadow mb-4">
          <div
            class="card-header bg-primary text-white d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0"><i class="bi bi-building me-2"></i>Información Legal y Negocio</h5>
            <span v-if="isSeller" class="badge bg-light text-primary border">
              <i class="bi bi-eye-fill me-1"></i> Solo lectura
            </span>
          </div>
          <div class="card-body">
            <div v-if="isSeller" class="alert alert-info py-2 small">
              <i class="bi bi-info-circle me-2"></i> Como vendedor, puedes ver la información del
              negocio pero no editarla.
            </div>

            <form @submit.prevent="handleSaveBusiness">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Nombre del Negocio</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formBusiness.nombre"
                    :disabled="isSeller"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">NIT / Identificación Fiscal</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formBusiness.nit"
                    :disabled="isSeller"
                  />
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    class="form-control"
                    v-model="formBusiness.telefono"
                    :disabled="isSeller"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Administrador Responsable</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formBusiness.admin"
                    :disabled="isSeller"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Dirección Física</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formBusiness.direccion"
                  :disabled="isSeller"
                />
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Logo del Negocio</label>
                <div class="d-flex align-items-start gap-3">
                  <div
                    v-if="appConfig.businessDetails.logo || logoPreview"
                    class="border p-2 rounded bg-light"
                  >
                    <img
                      :src="logoPreview || appConfig.businessDetails.logo"
                      alt="Logo"
                      class="img-preview"
                    />
                  </div>
                  <div class="flex-grow-1" v-if="!isSeller">
                    <input
                      type="file"
                      class="form-control"
                      @change="onFileSelected"
                      accept="image/*"
                    />
                    <small class="text-muted">Se recomienda formato PNG o JPG (Máx 2MB).</small>
                  </div>
                </div>
              </div>

              <div class="d-grid" v-if="!isSeller">
                <button type="submit" class="btn btn-primary" :disabled="appConfig.isLoading">
                  <span
                    v-if="appConfig.isLoading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  <i v-else class="bi bi-cloud-arrow-up me-2"></i>Guardar Cambios en Servidor
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="card shadow border-0">
          <div class="card-header bg-dark text-white">
            <h5 class="mb-0"><i class="bi bi-palette me-2"></i>Preferencias de Interfaz</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-bold">Tema Visual</label>
                <select
                  class="form-select"
                  v-model="appConfig.uiPreferences.theme"
                  @change="handleUiUpdate"
                >
                  <option value="light">Modo Claro</option>
                  <option value="dark">Modo Oscuro</option>
                  <option value="system">Seguir Sistema</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Idioma del Panel</label>
                <select
                  class="form-select"
                  v-model="appConfig.uiPreferences.language"
                  @change="handleUiUpdate"
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                </select>
              </div>
              <div class="col-12 mt-4">
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="notifSwitch"
                    v-model="appConfig.uiPreferences.enableNotifications"
                    @change="handleUiUpdate"
                  />
                  <label class="form-check-label" for="notifSwitch"
                    >Activar notificaciones visuales en el navegador</label
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="appConfig.error" class="alert alert-danger mt-4 shadow-sm">
          <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ appConfig.error }}
        </div>
      </div>
    </div>

    <NotificationModal
      :is-visible="mostrarModalNotificacion"
      :message="notificationMessage"
      :is-error="notificationIsError"
      @close="closeNotificationModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useAppConfigStore, type BusinessDetails } from '@/store/useAppConfigStore'
import { useAuthStore } from '@/store/authStore' // Importamos el authStore
import NotificationModal from '@/components/utils/NotificationModal.vue'
import { AxiosError } from 'axios'

const appConfig = useAppConfigStore()
const authStore = useAuthStore()

/**
 * Lógica de permisos
 */
const isSeller = computed(() => authStore.user.role === 'seller')

// --- ESTADO PARA MODALES DE NOTIFICACIÓN ---
const mostrarModalNotificacion = ref(false)
const notificationMessage = ref('')
const notificationIsError = ref(false)

const showNotification = (message: string, isError: boolean = false) => {
  notificationMessage.value = message
  notificationIsError.value = isError
  mostrarModalNotificacion.value = true
}

const closeNotificationModal = () => {
  mostrarModalNotificacion.value = false
}

// Estado local para el formulario
const logoFile = ref<File | null>(null)
const logoPreview = ref<string | null>(null)

const formBusiness = reactive({
  nombre: appConfig.businessDetails.nombre,
  nit: appConfig.businessDetails.nit,
  telefono: appConfig.businessDetails.telefono,
  direccion: appConfig.businessDetails.direccion,
  admin: appConfig.businessDetails.admin,
})

watch(
  () => appConfig.businessDetails,
  (newVal) => {
    Object.assign(formBusiness, newVal)
  },
  { deep: true },
)

const onFileSelected = (event: Event) => {
  if (isSeller.value) return // Seguridad extra en el frontend

  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    logoFile.value = file
    logoPreview.value = URL.createObjectURL(file)
  }
}

const handleSaveBusiness = async () => {
  // Verificación de seguridad antes de proceder
  if (isSeller.value) {
    showNotification('No tienes permisos para realizar esta acción.', true)
    return
  }

  try {
    const data = new FormData()
    data.append('nombre', formBusiness.nombre)
    data.append('nit', formBusiness.nit || '')
    data.append('telefono', formBusiness.telefono || '')
    data.append('direccion', formBusiness.direccion || '')
    data.append('admin', formBusiness.admin || '')

    if (logoFile.value) {
      data.append('logo_file', logoFile.value)
    }

    await appConfig.updateBusinessDetails(data as unknown as BusinessDetails)
    showNotification('✅ Configuración del negocio actualizada exitosamente.', false)
    logoFile.value = null
    logoPreview.value = null
  } catch (err) {
    if (err instanceof AxiosError) {
      showNotification('❌ Error al actualizar la configuración: ' + err.message, true)
    }
  }
}

const handleUiUpdate = () => {
  appConfig.setUiPreferences(appConfig.uiPreferences)
}
</script>
