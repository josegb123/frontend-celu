import { defineStore } from 'pinia'
import laravelApi from '@/http/laravelApi'
import { AxiosError } from 'axios'
// Importaciones de la API de setup
import { ref, computed } from 'vue'
// Importación del nuevo servicio y tipos
import { cajaService, type TipoMovimiento } from '@/services/CajaService'

/**
 * 1. INTERFACE: Define la estructura de la Caja Diaria.
 */
export interface CajaDiaria {
  id: number
  user_id: number
  fondo_inicial: number

  // Campos que pueden ser nulos hasta el cierre de la caja
  monto_cierre_fisico: number | null
  // Eliminamos monto_cierre_teorico aquí, ya que lo calcularemos en el store
  estado: 'abierta' | 'cerrada'
  fecha_apertura: string
  fecha_cierre: string | null

  created_at?: string
  updated_at?: string
}

/**
 * 2. INTERFACE: Define la estructura del reporte que devuelve el backend al cerrar la caja.
 */
export interface ReporteCierre {
  id: number
  fondo_inicial: number
  monto_teorico: number // El reporte SÍ tiene que devolverlo al final
  monto_fisico: number
  diferencia: number
  estado: 'cerrada'
}

// ----------------------------------------------------
// CAMBIO DE ESTRUCTURA: Migración a la API de Setup
// ----------------------------------------------------

export const useCajaStore = defineStore('caja', () => {
  // --- ESTADO  ---
  const cajaActiva = ref<CajaDiaria | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // NUEVO ESTADO: Monto calculado a partir de movimientos
  const montoTeoricoActual = ref(0)

  // --- GETTERS (reemplaza 'getters') ---
  const isCajaAbierta = computed(() => !!cajaActiva.value && cajaActiva.value.estado === 'abierta')
  const cajaDiariaId = computed(() => cajaActiva.value?.id || null)
  const fondoInicial = computed(() => cajaActiva.value?.fondo_inicial || 0)

  // GETTER: Expone el estado calculado
  const getMontoTeorico = computed(() => montoTeoricoActual.value)

  // --- ACTIONS (reemplaza 'actions') ---

  /**
   * @description Calcula el monto teórico actual (Fondo Inicial + Ingresos Efectivo - Egresos Efectivo).
   */
  async function calcularMontoTeorico(): Promise<void> {
    const currentCajaId = cajaDiariaId.value
    if (currentCajaId === null) {
      montoTeoricoActual.value = 0
      return
    }

    try {
      isLoading.value = true

      // 1. Obtener los movimientos de EFECTIVO para la caja activa.
      // Filtramos por caja_diaria_id y método de pago.
      const response = await cajaService.getMovimientos({
        caja_diaria_id: currentCajaId,
        metodo_pago: 'efectivo', // Solo el efectivo afecta el saldo físico
        per_page: 500, // Ajuste para intentar obtener todos los movimientos de una caja
      })

      let totalMovimientosEfectivo = 0

      // 2. Sumar o restar los montos
      response.data.forEach((movimiento) => {
        const monto = parseFloat(movimiento.monto)

        if (movimiento.tipo === 'Ingreso') {
          totalMovimientosEfectivo += monto
        } else if (movimiento.tipo === 'Egreso') {
          totalMovimientosEfectivo -= monto
        }
      })

      // 3. Cálculo Final: Fondo Inicial + Flujo de Efectivo
      montoTeoricoActual.value = fondoInicial.value + totalMovimientosEfectivo
    } catch (err) {
      error.value = 'Fallo al calcular el monto teórico de la caja.'
      console.error('Error al calcular monto teórico:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCajaActiva(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const response = await laravelApi.get<{ caja: CajaDiaria | null }>('/cajas/activa')

      const caja = response.data.caja

      if (caja && caja.estado === 'abierta') {
        cajaActiva.value = caja
        // Llamar al cálculo después de establecer la caja
        await calcularMontoTeorico()
      } else {
        cajaActiva.value = null
        montoTeoricoActual.value = 0
      }
    } catch (err: unknown) {
      console.error('Error al obtener caja activa:', err)

      const axiosError = err as AxiosError<{ message: string }>
      error.value =
        axiosError.response?.data?.message || 'No se pudo verificar el estado de la caja.'
      cajaActiva.value = null
      montoTeoricoActual.value = 0
    } finally {
      isLoading.value = false
    }
  }

  async function openCaja(fondoInicialParam: number): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const response = await laravelApi.post<{ caja: CajaDiaria }>('/cajas/apertura', {
        fondo_inicial: fondoInicialParam,
      })

      cajaActiva.value = response.data.caja
      // Llamar al cálculo (debería ser igual al fondo inicial, pero asegura el estado)
      await calcularMontoTeorico()
      return true
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>
      error.value = axiosError.response?.data?.message || 'Error al intentar abrir la caja.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function closeCaja(montoCierreFisico: number): Promise<ReporteCierre | false> {
    if (!cajaActiva.value) {
      error.value = 'No hay una caja activa para cerrar.'
      return false
    }

    isLoading.value = true
    error.value = null
    const cajaId = cajaActiva.value.id

    try {
      const response = await laravelApi.post<{ reporte: ReporteCierre }>(
        `/cajas/${cajaId}/cierre`,
        {
          monto_cierre_fisico: montoCierreFisico,
          // Enviar el teórico calculado al backend para que haga la validación/registro final
          monto_cierre_teorico: getMontoTeorico.value,
        },
      )

      clearCajaActiva()
      return response.data.reporte
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>
      error.value = axiosError.response?.data?.message || 'Error al intentar cerrar la caja.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearCajaActiva(): void {
    cajaActiva.value = null
    error.value = null
    isLoading.value = false
    montoTeoricoActual.value = 0 // Resetear
  }

  /**
   * @description Implementación del registro de movimiento manual (ej: egreso).
   * Se utiliza en la interfaz de egresos/ingresos manuales.
   */
  async function registrarMovimientoManual(
    monto: number,
    tipo: TipoMovimiento,
    tipoMovimientoId: number,
  ) {
    const currentCajaId = cajaDiariaId.value
    if (currentCajaId === null) {
      error.value = 'No hay caja activa para registrar el movimiento.'
      throw new Error('No hay caja activa.')
    }

    try {
      isLoading.value = true

      await cajaService.createMovimiento({
        monto,
        tipo,
        tipo_movimiento_id: tipoMovimientoId,
        metodo_pago: 'efectivo',
        caja_diaria_id: currentCajaId,
      })

      // Actualizar el monto teórico inmediatamente después de un movimiento exitoso
      await calcularMontoTeorico()
    } catch (err) {
      error.value = 'Fallo al registrar el movimiento manual.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // --- RETORNO FINAL (API de Setup) ---
  return {
    cajaActiva,
    isLoading,
    error,
    // Getters
    isCajaAbierta,
    cajaDiariaId,
    fondoInicial,
    montoTeoricoActual: getMontoTeorico, // Exponemos el valor calculado
    // Actions
    fetchCajaActiva,
    openCaja,
    closeCaja,
    clearCajaActiva,
    calcularMontoTeorico, // Para recálculo bajo demanda
    registrarMovimientoManual, // Para registrar retiros/ingresos
  }
})
