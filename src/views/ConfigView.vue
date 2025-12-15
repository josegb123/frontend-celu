<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-lg-10 mx-auto">
        <h2 class="mb-4 text-center">Configuración de la Aplicación</h2>

        <!-- Detalles del Negocio -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Detalles del Negocio</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveBusinessDetails">
              <div class="mb-3">
                <label for="businessName" class="form-label">Nombre del Negocio</label>
                <input type="text" class="form-control" id="businessName" v-model="appConfig.businessDetails.name" />
              </div>
              <div class="mb-3">
                <label for="businessPhone" class="form-label">Teléfono</label>
                <input type="tel" class="form-control" id="businessPhone" v-model="appConfig.businessDetails.phone" />
              </div>
              <div class="mb-3">
                <label for="businessAddress" class="form-label">Dirección</label>
                <input type="text" class="form-control" id="businessAddress" v-model="appConfig.businessDetails.address" />
              </div>
              <div class="mb-3">
                <label for="businessAdmin" class="form-label">Administrador (Nombre)</label>
                <input type="text" class="form-control" id="businessAdmin" v-model="appConfig.businessDetails.administrator" />
              </div>
              <div class="mb-3">
                <label for="businessNit" class="form-label">NIT / Identificación Fiscal</label>
                <input type="text" class="form-control" id="businessNit" v-model="appConfig.businessDetails.nit" />
              </div>
              <div class="mb-3">
                <label for="businessLogo" class="form-label">URL del Logo (o Subir Logo)</label>
                <input type="text" class="form-control" id="businessLogo" v-model="appConfig.businessDetails.logoUrl" />
                <small class="form-text text-muted">Aquí podrías integrar una subida de archivo o selector de imágenes.</small>
                <div v-if="appConfig.businessDetails.logoUrl" class="mt-2">
                  <img :src="appConfig.businessDetails.logoUrl" alt="Logo Actual" class="img-thumbnail" style="max-height: 100px;">
                </div>
              </div>
              <button type="submit" class="btn btn-primary">Guardar Cambios</button>
            </form>
          </div>
        </div>

        <!-- Opciones de Interfaz de Usuario (Frontend-only) -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">Preferencias de Interfaz de Usuario</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="themeSelect" class="form-label">Tema de la Aplicación</label>
              <select class="form-select" id="themeSelect" v-model="appConfig.uiPreferences.theme">
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="system">Sistema</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="languageSelect" class="form-label">Idioma</label>
              <select class="form-select" id="languageSelect" v-model="appConfig.uiPreferences.language">
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </select>
            </div>
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="enableNotifications" v-model="appConfig.uiPreferences.enableNotifications">
              <label class="form-check-label" for="enableNotifications">Mostrar Notificaciones Visuales</label>
            </div>
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="playSoundOnAlert" v-model="appConfig.uiPreferences.playSoundOnAlert">
              <label class="form-check-label" for="playSoundOnAlert">Reproducir Sonido en Alertas</label>
            </div>
            <button @click="saveUiPreferences" class="btn btn-info">Guardar Preferencias UI</button>
          </div>
        </div>

        <!-- Otras Configuraciones (Frontend-only) -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0">Otras Configuraciones</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="rowsPerPage" class="form-label">Registros por Página (Tablas)</label>
              <input type="number" class="form-control" id="rowsPerPage" v-model.number="appConfig.otherSettings.rowsPerPage" min="5" max="100">
            </div>
            <button @click="saveOtherSettings" class="btn btn-warning">Guardar Otras Configuraciones</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppConfigStore } from '@/store/useAppConfigStore';
// No es necesario storeToRefs para v-model directo si el estado es reactivo

const appConfig = useAppConfigStore();

const saveBusinessDetails = () => {
  appConfig.setBusinessDetails(appConfig.businessDetails);
  alert('Detalles del negocio guardados localmente.');
};

const saveUiPreferences = () => {
  appConfig.setUiPreferences(appConfig.uiPreferences);
  alert('Preferencias de UI guardadas localmente.');
};

const saveOtherSettings = () => {
  appConfig.setOtherSettings(appConfig.otherSettings);
  alert('Otras configuraciones guardadas localmente.');
};

// No es necesario cargar al iniciar aquí, ya se hace en main.ts
</script>

<style scoped>
.card-header {
  border-bottom: 0;
}
.img-thumbnail {
  max-width: 150px;
  height: auto;
}
</style>