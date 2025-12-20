import { defineStore } from 'pinia'
import laravelApi from '@/http/laravelApi'
import { AxiosError } from 'axios'
import { ref, computed } from 'vue'

// Importación del nuevo servicio y tipos (asumo que CajaService y TipoMovimiento están definidos)
import { cajaService, type TipoMovimiento } from '@/services/CajaService'

// --- INTERFACES ---

/**
 * Define la estructura de la Caja Diaria.
 */
export interface CajaDiaria {
  id: number
  user_id: number
  fondo_inicial: number

  monto_cierre_fisico: number | null
  monto_cierre_teorico: number | null

  estado: 'abierta' | 'cerrada'
  fecha_apertura: string
  fecha_cierre: string | null

  created_at?: string
  updated_at?: string
}

/**
 * Define la estructura del reporte que devuelve el backend al cerrar la caja.
 */
export interface ReporteCierre {
  id: number
  fondo_inicial: number
  monto_teorico: number
  monto_fisico: number
  diferencia: number
  estado: 'cerrada'
}

// ----------------------------------------------------

export const useCajaStore = defineStore('caja', () => {
  // --- ESTADO  ---
  const cajaActiva = ref<CajaDiaria | null>(null)
  const requiereCierre = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ESTADO: Monto calculado a partir de movimientos de efectivo
  const montoTeoricoActual = ref(0)

  // --- GETTERS ---
  const isCajaAbierta = computed(() => !!cajaActiva.value && cajaActiva.value.estado === 'abierta')
  const cajaDiariaId = computed(() => cajaActiva.value?.id || null)
  const fondoInicial = computed(() => cajaActiva.value?.fondo_inicial || 0)
  const getMontoTeorico = computed(() => montoTeoricoActual.value)

  // --- ACTIONS ---

  /**
   * Calcula el monto teórico actual (Fondo Inicial + Ingresos Efectivo - Egresos Efectivo).
   */
  async function calcularMontoTeorico(): Promise<void> {
    const currentCajaId = cajaDiariaId.value
    if (currentCajaId === null) {
      montoTeoricoActual.value = 0
      return
    }

    try {
      isLoading.value = true

      // Obtener los movimientos de EFECTIVO para la caja activa.
      const response = await cajaService.getMovimientos({
        caja_diaria_id: currentCajaId,
        metodo_pago: 'efectivo',
        per_page: 500,
      })

      let totalMovimientosEfectivo = 0

      // Sumar o restar los montos
      response.data.forEach((movimiento) => {
        const monto = parseFloat(movimiento.monto)

        if (isNaN(monto)) {
          console.warn(`Movimiento ID con monto no numérico omitido: ${movimiento.monto}`)
          return
        }

        if (movimiento.tipo === 'Ingreso') {
          totalMovimientosEfectivo += monto
        } else if (movimiento.tipo === 'Egreso') {
          totalMovimientosEfectivo -= monto
        }
      })

      // Cálculo Final: Fondo Inicial + Flujo de Efectivo
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
      const response = await laravelApi.get<{
        caja: CajaDiaria
        requiere_cierre_manual: boolean | null
      }>('/cajas/activa')

      const caja = response.data.caja
      requiereCierre.value = !!response.data?.requiere_cierre_manual
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

  /**
   * Abre una nueva sesión de caja.
   */
  async function openCaja(fondoInicialParam: number): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const response = await laravelApi.post<{ caja: CajaDiaria }>('/cajas/apertura', {
        fondo_inicial: fondoInicialParam,
      })

      cajaActiva.value = response.data.caja
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

  /**
   * Cierra la caja activa.
   */
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

  /**
   * Limpia el estado de la caja activa.
   */
  function clearCajaActiva(): void {
    cajaActiva.value = null
    error.value = null
    isLoading.value = false
    montoTeoricoActual.value = 0
  }

  /**
   * Implementación del registro de movimiento manual (ej: egreso).
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

  /**
   * @description Sincroniza el ID de la caja activa forzosamente.
   * Usado por componentes que lo descubren de forma asíncrona (ej: AbonoModal).
   * Si el store está vacío, llama a fetchCajaActiva() para cargar todos los detalles.
   * @param newCajaId El ID de la caja activa.
   */
  async function setCajaDiariaId(newCajaId: number | null): Promise<void> {
    if (newCajaId === null) {
      clearCajaActiva()
      return
    }

    // Si el ID ya está seteado y coincide, salimos.
    if (cajaActiva.value && cajaActiva.value.id === newCajaId) {
      return
    }

    // Si no hay caja cargada, forzamos la carga completa desde la API.
    if (!cajaActiva.value) {
      await fetchCajaActiva()
    } else {
      // Si hay una caja cargada pero el ID es diferente, asumimos que fue una
      // recarga en segundo plano (u otro flujo) y forzamos el recálculo por si acaso.
      // Nota: Mutamos directamente solo el ID para simplificar el flujo AbonoModal/Store.
      cajaActiva.value.id = newCajaId
    }

    // Recalculamos el monto teórico después de cualquier cambio forzado.
    await calcularMontoTeorico()
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
    montoTeoricoActual: getMontoTeorico,
    requiereCierre,
    // Actions
    fetchCajaActiva,
    openCaja,
    closeCaja,
    clearCajaActiva,
    calcularMontoTeorico,
    registrarMovimientoManual,
    setCajaDiariaId,
  }
})
