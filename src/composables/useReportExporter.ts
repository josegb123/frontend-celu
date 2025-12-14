import { computed, type Ref } from 'vue';
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { estadisticasService } from '@/services/estadisticasService'
import type {
  ProductoBajoStock,
  VentasPorCategoriaEstadistica,
  TicketPromedioResponse,
  HistorialGananciasEstadistica,
  TopCliente,
  TopProducto,
  ProductoBajaRotacion,
  ValorPedidosProveedoresResponse,
  TopClienteFrecuencia,
  VentasPorPeriodoApiRequest, // Kept this as it is used for params
  ExportarVentasExcelRequest,
} from '@/interfaces/reports/report_types'

type ReportType =
  | 'bajoStock'
  | 'ventasAgrupadas'
  | 'ventasPorCategoria'
  | 'ticketPromedio'
  | 'historialGanancias'
  | 'topClientes'
  | 'topProductos'
  | 'productosBajaRotacion'
  | 'valorPedidosProveedores'
  | 'topClientesFrecuencia'

type PeriodoType = 'day' | 'month' | 'year'

interface BusinessData {
  nombre: string
  propietario: string
  nit: string
  direccion: string
  tel: string
}

export function useReportExporter(
  selectedReport: Ref<ReportType>,
  reportData: Ref<unknown | null>, // Changed from any to unknown
  loading: Ref<boolean>,
  ventasPeriodo: Ref<PeriodoType>,
  fechaInicio: Ref<string>,
  fechaFin: Ref<string>,
  DATOS_NEGOCIO: BusinessData,
) {
  const isPdfButtonDisabled = computed(() => {
    return (
      loading.value ||
      !reportData.value ||
      (Array.isArray(reportData.value) && reportData.value.length === 0)
    )
  })

  const isExcelButtonDisabled = computed(() => {
    if (loading.value) return true
    if (selectedReport.value !== 'ventasAgrupadas') return true
    if (!reportData.value) return true
    if (!Array.isArray(reportData.value)) return true
    if (reportData.value.length === 0) return true
    return false
  })

  const generatePdfHeader = (doc: jsPDF, title: string, currentY: number) => {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(DATOS_NEGOCIO.nombre, 14, currentY)
    currentY += 5

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`NIT: ${DATOS_NEGOCIO.nit}`, 14, currentY)
    currentY += 4
    doc.text(`Tel: ${DATOS_NEGOCIO.tel} | Dir: ${DATOS_NEGOCIO.direccion}`, 14, currentY)

    currentY += 8
    doc.setLineWidth(0.5)
    doc.line(14, currentY, 196, currentY)

    currentY += 8

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(title, 14, currentY)

    return currentY + 4 // Return new Y position after title
  }

  const exportToPdf = async () => {
    if (isPdfButtonDisabled.value) {
      alert('No hay datos o el reporte seleccionado no es exportable a PDF.')
      return
    }

    loading.value = true
    try {
      const doc = new jsPDF()
      let currentY = 10
      let headers: string[][] = []
      let data: (string | number)[][] = []
      let title = ''

      switch (selectedReport.value) {
        case 'bajoStock':
          title = 'Reporte de Productos con Stock Bajo Umbral'
          currentY = generatePdfHeader(doc, title, currentY)
          headers = [['ID', 'Nombre Producto', 'Stock Actual']]
          data = (reportData.value as ProductoBajoStock[]).map((item) => [
            item.id,
            item.nombre,
            item.stock_actual,
          ])
          break
        case 'ventasAgrupadas':
          // This report uses a server-side PDF export, so call the service directly
          await exportServerSidePdf(
            { periodo: ventasPeriodo.value } as VentasPorPeriodoApiRequest,
            `ventas_agrupadas_${ventasPeriodo.value}.pdf`,
          )
          loading.value = false // Prevent finally block from overriding
          return
        case 'ventasPorCategoria':
          title = 'Reporte de Ventas por Categoría'
          currentY = generatePdfHeader(doc, title, currentY)
          headers = [['Categoría', 'Unidades Vendidas', 'Total Ventas']]
          data = (reportData.value as VentasPorCategoriaEstadistica[]).map((item) => [
            item.categoria_nombre,
            item.total_unidades_vendidas,
            item.total_ventas_categoria,
          ])
          break
        case 'historialGanancias':
          title = 'Reporte Historial de Ganancias'
          currentY = generatePdfHeader(doc, title, currentY)
          headers = [['Período', 'Beneficio Bruto']]
          data = (reportData.value as HistorialGananciasEstadistica[]).map((item) => [
            item.periodo_fecha,
            item.beneficio_bruto,
          ])
          break
        case 'topClientes':
          title = 'Reporte Top Clientes por Monto'
          currentY = generatePdfHeader(doc, title, currentY)
          headers = [['ID Cliente', 'Nombre Cliente', 'Monto Total Comprado']]
          data = (reportData.value as TopCliente[]).map((item) => [
            item.cliente_id,
            item.nombre_cliente,
            item.monto_total,
          ])
          break
        case 'topProductos':
          title = 'Reporte Top Productos Vendidos'
          currentY = generatePdfHeader(doc, title, currentY)
          headers = [['ID Producto', 'Nombre Producto', 'Unidades Vendidas']]
          data = (reportData.value as TopProducto[]).map((item) => [
            item.producto_id,
            item.nombre_producto,
            item.unidades_vendidas,
          ])
          break
        case 'productosBajaRotacion':
          title = 'Reporte Productos de Baja Rotación'
          currentY = generatePdfHeader(doc, title, currentY)
          headers = [['ID', 'Nombre', 'Stock', 'Unidades Vendidas (Período)', 'Última Venta']]
          data = (reportData.value as ProductoBajaRotacion[]).map((item) => [
            item.id,
            item.nombre,
            item.stock,
            item.unidades_vendidas_en_periodo,
            item.ultima_venta ?? 'N/A',
          ])
          break
        case 'valorPedidosProveedores':
          title = 'Reporte Valor de Pedidos a Proveedores'
          currentY = generatePdfHeader(doc, title, currentY)

          // Specific details for ValorPedidosProveedores
          doc.setFontSize(12)
          doc.setFont('helvetica', 'normal')
          doc.text(
            `Total Gastado: ${(reportData.value as ValorPedidosProveedoresResponse).total_gasto_proveedores} COP`,
            14,
            currentY,
          )
          currentY += 5
          doc.text(
            `Período: ${(reportData.value as ValorPedidosProveedoresResponse).periodo.start_date} a ${(reportData.value as ValorPedidosProveedoresResponse).periodo.end_date}`,
            14,
            currentY,
          )
          currentY += 10

          if (
            (reportData.value as ValorPedidosProveedoresResponse).detalles_por_proveedor.length > 0
          ) {
            headers = [['Proveedor', 'Total Gastado']]
            data = (reportData.value as ValorPedidosProveedoresResponse).detalles_por_proveedor.map(
              (item) => [item.nombre_proveedor, item.total_gastado],
            )
          } else {
            doc.text(
              'No hay detalles de pedidos a proveedores para el período seleccionado.',
              14,
              currentY + 10,
            )
            doc.save('reporte_valor_pedidos_proveedores.pdf') // Save and exit if no details
            loading.value = false
            return
          }
          break
        case 'topClientesFrecuencia':
          title = 'Reporte Top Clientes por Frecuencia'
          currentY = generatePdfHeader(doc, title, currentY)
          headers = [
            ['ID Cliente', 'Nombre Cliente', 'Email Cliente', 'Número de Compras', 'Última Compra'],
          ]
          data = (reportData.value as TopClienteFrecuencia[]).map((item) => [
            item.cliente_id,
            item.nombre_cliente,
            item.email_cliente ?? 'N/A',
            item.numero_compras_en_periodo,
            item.ultima_compra ?? 'N/A',
          ])
          break
        case 'ticketPromedio':
          // Ticket promedio is a single value, not a table.
          // Add a simple display for it in the PDF
          title = 'Reporte de Ticket Promedio de Venta'
          currentY = generatePdfHeader(doc, title, currentY)
          doc.setFontSize(12)
          doc.setFont('helvetica', 'normal')
          doc.text(
            `Monto Promedio de Venta: ${(reportData.value as TicketPromedioResponse).monto_promedio_venta} ${(reportData.value as TicketPromedioResponse).unidad}`,
            14,
            currentY + 10,
          )
          doc.save('reporte_ticket_promedio.pdf')
          loading.value = false
          return
        default:
          alert('Este tipo de reporte no tiene una exportación a PDF definida localmente.')
          loading.value = false
          return
      }

      // Only generate table if headers and data are present
      if (headers.length > 0 && data.length > 0) {
        autoTable(doc, {
          startY: currentY + 4,
          head: headers,
          body: data,
          theme: 'striped',
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [200, 200, 200],
            textColor: [0, 0, 0],
          },
          margin: { left: 14, right: 14 },
        })
      }

      doc.save(`${selectedReport.value}_report.pdf`)
      alert('Reporte PDF generado y descargado con éxito.')
    } catch (error) {
      console.error('Error al exportar a PDF:', error)
      alert('Hubo un error al generar el reporte PDF.')
    } finally {
      loading.value = false
    }
  }

  const exportServerSidePdf = async (params: VentasPorPeriodoApiRequest, filename: string) => {
    // Changed params: any to specific type
    try {
      const response = await estadisticasService.exportarVentasPdf(params)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(link.href)
      alert('Reporte PDF generado y descargado con éxito.')
    } catch (error) {
      console.error('Error al exportar PDF desde el servidor:', error)
      alert('Hubo un error al generar el reporte PDF desde el servidor.')
    }
  }

  const exportToExcel = async () => {
    if (isExcelButtonDisabled.value) {
      alert(
        'No hay datos o el reporte seleccionado no es "Ventas Agrupadas" para exportar a Excel.',
      )
      return
    }

    loading.value = true
    try {
      const params: ExportarVentasExcelRequest = { periodo: ventasPeriodo.value }
      const response = await estadisticasService.exportarVentasExcel(params)
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.setAttribute('download', `ventas_agrupadas_${ventasPeriodo.value}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(link.href)
      alert('Reporte Excel generado y descargado con éxito.')
    } catch (error) {
      console.error('Error al exportar a Excel:', error)
      alert('Hubo un error al generar el reporte Excel.')
    } finally {
      loading.value = false
    }
  }

  return {
    exportToPdf,
    exportToExcel,
    isPdfButtonDisabled,
    isExcelButtonDisabled,
  }
}
