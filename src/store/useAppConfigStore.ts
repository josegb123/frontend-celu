import { defineStore } from 'pinia'
import { AxiosError } from 'axios'
import laravelApi from '@/http/laravelApi'

// --- INTERFACES ---

export interface BusinessDetails {
  nombre: string
  telefono: string
  direccion: string
  admin: string
  nit: string
  logo: string
}

interface UIPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'es' | 'en'
  enableNotifications: boolean
}

interface AppConfigState {
  businessDetails: BusinessDetails
  uiPreferences: UIPreferences
  isLoading: boolean
  error: string | null
}

// --- STORE ---

export const useAppConfigStore = defineStore('appConfig', {
  state: (): AppConfigState => ({
    businessDetails: {
      nombre: 'Cargando...',
      telefono: '',
      direccion: '',
      admin: '',
      nit: '',
      logo: '',
    },
    uiPreferences: {
      theme: 'light',
      language: 'es',
      enableNotifications: true,
    },
    isLoading: false,
    error: null,
  }),

  getters: {
    getBusinessName: (state): string => state.businessDetails.nombre,
    getBusinessLogo: (state): string => state.businessDetails.logo,
    getTheme: (state) => state.uiPreferences.theme,
    getBusinessAdmin: (state) => state.businessDetails.admin,
    getBusinessNit: (state) => state.businessDetails.nit,
    getBusinessPhone: (state) => state.businessDetails.telefono,
    getBusinessAddress: (state) => state.businessDetails.direccion,
    getLanguage: (state) => state.uiPreferences.language,
    getNotificationsEnabled: (state) => state.uiPreferences.enableNotifications,
  },

  actions: {
    /**
     * Inicialización global de la configuración
     */
    async initialize(): Promise<void> {
      this.loadUiFromStorage()
      await this.fetchBusinessSettings()
    },

    /**
     * Carga preferencias de interfaz desde LocalStorage (Persistente por navegador)
     */
    loadUiFromStorage(): void {
      const savedUi = localStorage.getItem('app_ui_prefs')
      if (savedUi) {
        try {
          this.uiPreferences = { ...this.uiPreferences, ...JSON.parse(savedUi) }
          // Aplicar tema al documento al cargar
          this.applyTheme(this.uiPreferences.theme)
        } catch {
          console.error('Error al parsear preferencias de UI locales')
        }
      }
    },

    /**
     * Obtiene los datos del negocio desde el Backend
     */
    async fetchBusinessSettings(): Promise<void> {
      this.isLoading = true
      this.error = null
      try {
        // GET a la ruta que creamos: /settings/business
        const { data } = await laravelApi.get<BusinessDetails>('/settings/business')

        // Actualizamos el estado con la respuesta del servidor
        this.businessDetails = {
          nombre: data.nombre || 'Mi Negocio',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          admin: data.admin || '',
          nit: data.nit || '',
          logo: data.logo || '',
        }
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          this.error =
            err.response?.data?.message || 'No se pudo obtener la configuración del negocio'
        } else {
          this.error = 'Error inesperado al cargar configuración'
        }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Guarda los cambios del negocio en el Backend
     * Soporta el envío de FormData (con archivos) o JSON parcial
     */
    async updateBusinessDetails(details: FormData | Partial<BusinessDetails>): Promise<void> {
      this.isLoading = true
      this.error = null // Limpiamos errores previos

      try {
        // Configuramos los headers dinámicamente según el tipo de dato
        const isFormData = details instanceof FormData

        const { data } = await laravelApi.post<{ data: BusinessDetails }>(
          '/settings/business',
          details,
          {
            headers: {
              // Si es FormData, dejamos que el navegador ponga el Content-Type con el boundary correcto
              // NO forzamos 'application/json'
              'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
            },
          },
        )

        // Actualizamos el estado con la respuesta fresca del servidor
        this.businessDetails = data.data
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          // Capturamos el mensaje detallado de Laravel
          const msg = err.response?.data?.message || 'Error al actualizar configuración'
          this.error = msg
          // Re-lanzamos para que el componente (View) pueda mostrar la notificación
          throw err
        }
        throw new Error('Error inesperado')
      } finally {
        this.isLoading = false
      }
    },
    /**
     * Actualiza preferencias de UI y las guarda localmente
     */
    setUiPreferences(preferences: Partial<UIPreferences>): void {
      this.uiPreferences = { ...this.uiPreferences, ...preferences }
      localStorage.setItem('app_ui_prefs', JSON.stringify(this.uiPreferences))

      if (preferences.theme) {
        this.applyTheme(preferences.theme)
      }
    },

    /**
     * Aplica el tema de Bootstrap 5 al HTML
     */
    applyTheme(theme: 'light' | 'dark' | 'system'): void {
      const targetTheme =
        theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark').matches
            ? 'dark'
            : 'light'
          : theme

      document.documentElement.setAttribute('data-bs-theme', targetTheme)
    },
  },
})
