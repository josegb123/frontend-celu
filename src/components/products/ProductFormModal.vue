<template>
  <BaseModal :isVisible="isVisible" @close="closeModal">
    <template #header>
      <h3>{{ productToEdit ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
    </template>

    <template #body>
      <ProductForm
        :product-to-edit="productToEdit"
        :categories="categories"
        @product-saved="handleProductSaved"
        @open-category-modal="$emit('open-category-modal')"
      />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import ProductForm from './ProductForm.vue'
import BaseModal from '@/components/shared/BaseModal.vue'
import type { Producto } from '@/services/ProductoService'
import type { ICategoria } from '@/interfaces/ICategoria'

// Ensure `emit` is defined
const emit = defineEmits(['close', 'product-saved', 'open-category-modal'])

defineProps({
  isVisible: { type: Boolean, default: false },
  productToEdit: { type: Object as () => Producto | null, default: null },
  categories: { type: Array as () => ICategoria[], default: () => [] },
})

const closeModal = () => {
  // Emit close event to parent
  emit('close')
}

const handleProductSaved = (result: { success: boolean; message: string }) => {
  emit('product-saved', result)
}
</script>
