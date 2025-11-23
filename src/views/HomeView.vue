<template>
  <div class="container mt-5">
    <h2>🔎 Test de Búsqueda y Selección de Productos</h2>
    <div class="card p-4 shadow-sm">
      <div class="mb-3 product-search-container">
        <label for="searchInput" class="form-label">Buscar Producto (Mínimo 3 caracteres)</label>
        <input
          type="text"
          id="searchInput"
          class="form-control"
          placeholder="Escribe el nombre del producto..."
          v-model="searchQuery"
          @focus="isDropdownOpen = true"
          @blur="closeDropdownDelayed"
        />

        <div v-if="isDropdownOpen && searchResults.length" class="search-results-dropdown">
          <ul class="list-group">
            <li
              v-for="product in searchResults"
              :key="product.id"
              class="list-group-item list-group-item-action"
              @mousedown.prevent="selectProduct(product)"
            >
              {{ product.nombre }} (ID: {{ product.id }})
              <span class="text-info small float-end">Stock: {{ product.stock_actual }}</span>
            </li>
          </ul>
        </div>
      </div>

      ---

      <h4>Propiedades del Producto Seleccionado:</h4>
      <div v-if="selectedProduct" class="alert alert-success">
        <p><strong>ID:</strong> {{ selectedProduct.id }}</p>
        <p><strong>Nombre:</strong> {{ selectedProduct.nombre }}</p>
        <p><strong>Precio Venta:</strong> ${{ selectedProduct.precio_venta }}</p>
        <p><strong>Stock Actual:</strong> {{ selectedProduct.stock_actual }}</p>
      </div>
      <div v-else class="alert alert-info">
        <p>Ningún producto seleccionado aún.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ProductoService, { type Producto } from '@/services/ProductoService'

const searchQuery = ref('')
const searchResults = ref<Producto[]>([])
const isDropdownOpen = ref(false)
const selectedProduct = ref<Producto | null>(null)

// --- Lógica de Debounce ---
const DEBOUNCE_DELAY = 300
let debounceTimer: number | undefined

const performSearch = async (query: string) => {
  if (query.length < 3) {
    searchResults.value = []
    return
  }

  // ⬅️ CRÍTICO: Lógica de la API con manejo de errores
  try {
    // Llama al servicio que usa el endpoint /productos?search=query
    const results = await ProductoService.searchProductos(query)
    searchResults.value = results
  } catch (e) {
    console.error('Fallo al ejecutar la búsqueda:', e)
    searchResults.value = [] // Asegura que searchResults sea un array
  }
}

// ⬅️ Observador reactivo para el debounce
watch(searchQuery, (newQuery) => {
  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(() => {
    performSearch(newQuery)
  }, DEBOUNCE_DELAY)
})

const selectProduct = (product: Producto) => {
  selectedProduct.value = product
  searchQuery.value = product.nombre // Muestra el nombre en el input
  isDropdownOpen.value = false
  searchResults.value = [] // Limpiar resultados
}

const closeDropdownDelayed = () => {
  // Retraso para que el evento @mousedown (seleccionar) se ejecute antes del @blur
  setTimeout(() => {
    isDropdownOpen.value = false
    // Restaurar el nombre del producto seleccionado si el usuario no escribió nada
    if (selectedProduct.value && searchQuery.value !== selectedProduct.value.nombre) {
      searchQuery.value = selectedProduct.value.nombre
    }
  }, 150)
}

import laravelApi from '@/http/laravelApi.js' // Asumo que el cliente Axios está aquí
import type { AxiosRequestConfig } from 'axios'

// ----------------------------------------------------------------------
// 🚨 CONFIGURACIÓN NECESARIA 🚨
// ----------------------------------------------------------------------

// Reemplaza con tu token JWT para autenticar las peticiones
const BEARER_TOKEN = '2|8qsQtZMe7TD1NfqLx996EVYqGbIhBtDcIxjyuesta1aee24b'

// ID de un producto existente para probar la actualización (debe ser válido en tu DB)
const EXISTING_PRODUCT_ID = 5
// ID de una categoría existente para probar la creación (debe ser válido en tu DB)
const EXISTING_categoria_ID = 2

// Función para configurar el encabezado de autorización
const setAuthHeader = (token: string) => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  Object.assign(laravelApi.defaults, config)
}

// ----------------------------------------------------------------------
// 🎯 FUNCIÓN PRINCIPAL DE PRUEBA 🎯
// ----------------------------------------------------------------------

async function runTests() {
  if (BEARER_TOKEN === 'TU_TOKEN_JWT_AQUI') {
    console.error('ERROR: Por favor, define el BEARER_TOKEN antes de ejecutar las pruebas.')
    return
  }

  setAuthHeader(BEARER_TOKEN)

  // ----------------------------------------------------------
  // TEST 1: OBTENER PRODUCTOS (Listado, Paginación y Filtro)
  // ----------------------------------------------------------
  try {
    const params = {
      page: 1, // Este parámetro será ignorado por el backend
      search: 'Herramientas',
      categoria_id: 1,
    }
    // NOTA: Cambiamos la interfaz esperada a un Array de Producto[]
    await ProductoService.getProductos(params)
  } catch (error) {
    console.error('❌ TEST 1 FALLÓ (getProductos):', error)
  }

  // ----------------------------------------------------------
  // TEST 2: CREAR NUEVO PRODUCTO (POST)
  // ----------------------------------------------------------
  try {
    const newProductData = new FormData()

    // Simular datos de un producto nuevo
    newProductData.append('nombre', 'Producto de Prueba POST ' + Date.now())
    newProductData.append('precio_venta', '100.50')
    newProductData.append('stock_actual', '15')
    newProductData.append('stock_minimo', '5')
    newProductData.append('categoria_id', EXISTING_categoria_ID.toString())
    newProductData.append('user_id', '2') // Asegúrate de usar un ID de usuario válido
    newProductData.append('precio_compra', '50.25') // Un valor numérico válido
    newProductData.append('stock_reservado', '0') // Inicializar a cero

    await ProductoService.saveProducto(newProductData, null)
  } catch (error) {
    console.error('❌ TEST 2 FALLÓ (Creación):', error)
  }

  // ----------------------------------------------------------
  // TEST 3: ACTUALIZAR PRODUCTO EXISTENTE (PUT/PATCH)
  // ----------------------------------------------------------
  try {
    const updateData = new FormData()

    // Simular datos de actualización
    updateData.append('nombre', 'Producto Actualizado por PUT ' + Date.now())
    updateData.append('precio_venta', '125.75')

    await ProductoService.saveProducto(updateData, EXISTING_PRODUCT_ID)
  } catch (error) {
    console.error('❌ TEST 3 FALLÓ (Actualización):', error)
  }
}

runTests()
</script>

<style scoped>
/* Estilos mínimos para el dropdown */
.product-search-container {
  position: relative;
}

.search-results-dropdown {
  position: absolute;
  z-index: 1000;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  background-color: white;
  border-radius: 0.25rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: -1px;
}

.list-group-item-action:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}
</style>
