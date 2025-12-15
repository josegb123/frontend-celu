<script setup lang="ts">
// Define la interfaz Proveedor para tipado (idealmente importada de un archivo de tipos)
interface Proveedor {
  id: number
  nombreComercial: string
  nombreContacto: string | null
  identificacion: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  ciudad: string | null
  notas: string | null
  activo: boolean
}

// 1. Definición de Props: Recibe la lista de proveedores
defineProps({
  proveedores: Array<Proveedor>
})

// 2. Definición de Emits: Eventos que envían el proveedor/id para la acción
const emit = defineEmits(['edit', 'delete'])

import { useAppConfigStore } from '@/store/useAppConfigStore'; // Added this import
const appConfig = useAppConfigStore(); // Added this

// Nombre de la marca para los mensajes (puede venir de una configuración global o .env)
const branding_name = appConfig.getBusinessName; // Changed here

/**
 * @param telefono Número de teléfono del proveedor (incluye código de país).
 * @param nombre Nombre comercial del proveedor.
 */
function contactarProveedor(telefono: string | null, nombre: string) {
  if (!telefono) {
    alert(`El proveedor ${nombre} no tiene un número de teléfono registrado.`)
    return
  }

  // Mensaje preescrito. Puedes ajustarlo a tus necesidades.
  const mensaje = encodeURIComponent(
    `Hola ${nombre}, te escribo desde ${branding_name} para coordinar un nuevo pedido. ¿Estás disponible para conversar?`,
  )

  // Abre la URL de WhatsApp. Se recomienda incluir el código de país (ej: 57)
  window.open(`https://api.whatsapp.com/send?phone=${telefono}&text=${mensaje}`, '_blank')
}

/**
 * @param email Dirección de correo electrónico del proveedor.
 * @param nombre Nombre comercial del proveedor.
 */
function enviarCorreoProveedor(email: string | null, nombre: string) {
  if (!email) {
    alert(`El proveedor ${nombre} no tiene una dirección de correo electrónico registrada.`)
    return
  }

  // 1. Definir asunto y cuerpo del mensaje
  const asunto = encodeURIComponent(`Consulta de Pedido - ${branding_name}`)
  const cuerpo = encodeURIComponent(
    `Estimado(a) ${nombre},\n\nLe escribimos para solicitar información sobre disponibilidad y cotización para un nuevo pedido.\n\nEsperamos su pronta respuesta.\n\nAtentamente,\n${branding_name}`,
  )

  // 2. Construir el enlace mailto:
  // El navegador abrirá el cliente predeterminado (que puede ser Gmail si está configurado)
  const mailtoLink = `mailto:${email}?subject=${asunto}&body=${cuerpo}`

  window.location.href = mailtoLink
}
</script>

<template>
  <div class="table-responsive border rounded shadow-lg">
    <table class="table table-hover mb-0">
      <thead>
        <tr>
          <th scope="col">Compañía</th>
          <th scope="col" class="d-none d-sm-table-cell">Contacto</th>
          <th scope="col" class="d-none d-md-table-cell">Email / Teléfono</th>
          <th scope="col" class="text-center d-none d-md-table-cell">Estado</th>
          <th scope="col" class="text-end">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="proveedor in proveedores" :key="proveedor.id">
          <td>
            <div class="fw-bold">{{ proveedor.nombreComercial }}</div>
            <small class="text-muted">{{ proveedor.identificacion || 'N/A' }}</small>
          </td>
          <td class="d-none d-sm-table-cell">
            <div>{{ proveedor.nombreContacto || 'N/A' }}</div>
            <small class="text-muted">{{ proveedor.ciudad || 'Sin Ciudad' }}</small>
          </td>
          <td class="d-none d-md-table-cell">
            <p class="mb-0">{{ proveedor.email || 'Sin email' }}</p>
            <small class="text-muted">{{ proveedor.telefono || 'Sin teléfono' }}</small>
          </td>
          <td class="text-center d-none d-md-table-cell">
            <span :class="['badge', proveedor.activo ? 'bg-success' : 'bg-danger']">
              {{ proveedor.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td class="text-end text-nowrap">
            <button
              @click="enviarCorreoProveedor(proveedor.email, proveedor.nombreComercial)"
              class="btn btn-sm btn-secondary me-2"
              title="Enviar Correo"
              :disabled="!proveedor.email"
            >
              <i class="bi bi-envelope"></i>
            </button>

            <button
              @click="contactarProveedor(proveedor.telefono, proveedor.nombreComercial)"
              class="btn btn-sm btn-success me-2"
              title="Enviar WhatsApp"
              :disabled="!proveedor.telefono"
            >
              <i class="bi bi-whatsapp"></i>
            </button>

            <button
              @click="emit('edit', proveedor)"
              class="btn btn-sm btn-info text-white me-2"
              title="Editar"
            >
              <i class="bi bi-pencil"></i> <span class="d-none d-lg-inline">Editar</span>
            </button>
            <button
              @click="emit('delete', proveedor.id)"
              class="btn btn-sm btn-danger"
              title="Eliminar"
            >
              <i class="bi bi-trash"></i> <span class="d-none d-lg-inline">Eliminar</span>
            </button>
          </td>
        </tr>
        <tr v-if="proveedores.length === 0">
          <td colspan="5" class="text-center py-4 text-muted">
            No se encontraron proveedores que coincidan con la búsqueda.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>