import { defineStore } from 'pinia'

// --- Interfaces para las configuraciones ---
interface BusinessDetails {
  name: string
  phone: string
  address: string
  administrator: string
  nit: string
  logoUrl: string
}

interface UIPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'es' | 'en'
  enableNotifications: boolean
  playSoundOnAlert: boolean
}

interface OtherSettings {
  rowsPerPage: number
}

interface AppConfigState {
  businessDetails: BusinessDetails
  uiPreferences: UIPreferences
  otherSettings: OtherSettings
}

// --- Valores por defecto (si no hay nada en localStorage o .env) ---
const defaultBusinessDetails: BusinessDetails = {
  name: 'El chanchito Feliz', // Usar un valor por defecto claro
  phone: '',
  address: '',
  administrator: '',
  nit: '',
  logoUrl: '',
}

const defaultUiPreferences: UIPreferences = {
  theme: 'light',
  language: 'es',
  enableNotifications: true,
  playSoundOnAlert: false,
}

const defaultOtherSettings: OtherSettings = {
  rowsPerPage: 10,
}

export const useAppConfigStore = defineStore('appConfig', {
  state: (): AppConfigState => ({
    businessDetails: { ...defaultBusinessDetails },
    uiPreferences: { ...defaultUiPreferences },
    otherSettings: { ...defaultOtherSettings },
  }),

  getters: {
    // Getters para acceder fácilmente a los detalles del negocio
    getBusinessName: (state) => state.businessDetails.name,
    getBusinessPhone: (state) => state.businessDetails.phone,
    getBusinessAddress: (state) => state.businessDetails.address,
    getBusinessAdministrator: (state) => state.businessDetails.administrator,
    getBusinessNit: (state) => state.businessDetails.nit,
    getBusinessLogoUrl: (state) => state.businessDetails.logoUrl,

    // Getters para acceder fácilmente a las preferencias de UI
    getUiTheme: (state) => state.uiPreferences.theme,
    getUiLanguage: (state) => state.uiPreferences.language,
    getEnableNotifications: (state) => state.uiPreferences.enableNotifications,
    getPlaySoundOnAlert: (state) => state.uiPreferences.playSoundOnAlert,

    // Getters para otras configuraciones
    getRowsPerPage: (state) => state.otherSettings.rowsPerPage,
  },

  actions: {
    // Acción para inicializar la configuración desde localStorage
    initialize() {
      // Cargar detalles del negocio
      const savedBusinessDetails = localStorage.getItem('businessDetails')
      if (savedBusinessDetails) {
        this.businessDetails = { ...this.businessDetails, ...JSON.parse(savedBusinessDetails) }
      }
      // Cargar preferencias de UI
      const savedUiPreferences = localStorage.getItem('uiPreferences')
      if (savedUiPreferences) {
        this.uiPreferences = { ...this.uiPreferences, ...JSON.parse(savedUiPreferences) }
      }
      // Cargar otras configuraciones
      const savedOtherSettings = localStorage.getItem('otherSettings')
      if (savedOtherSettings) {
        this.otherSettings = { ...this.otherSettings, ...JSON.parse(savedOtherSettings) }
      }
    },

    // Acciones para actualizar y guardar en localStorage
    setBusinessDetails(details: Partial<BusinessDetails>) {
      this.businessDetails = { ...this.businessDetails, ...details }
      localStorage.setItem('businessDetails', JSON.stringify(this.businessDetails))
    },

    setUiPreferences(preferences: Partial<UIPreferences>) {
      this.uiPreferences = { ...this.uiPreferences, ...preferences }
      localStorage.setItem('uiPreferences', JSON.stringify(this.uiPreferences))
      // Podrías emitir un evento o aplicar los cambios de tema/idioma aquí
    },

    setOtherSettings(settings: Partial<OtherSettings>) {
      this.otherSettings = { ...this.otherSettings, ...settings }
      localStorage.setItem('otherSettings', JSON.stringify(this.otherSettings))
    },
  },
})
