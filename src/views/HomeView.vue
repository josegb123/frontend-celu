<template>
  <AdminDashboard v-if="userRole === 'admin'" />
  <SellerDashboard v-else-if="userRole === 'seller'" />

  <div v-else class="d-flex justify-content-center align-items-center vh-100">
    <div class="spinner-border text-primary" role="status"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/store/authStore'
import AdminDashboard from './AdminDashboard.vue'
import SellerDashboard from './SellerDashboard.vue'

const authStore = useAuthStore()
const userRole = computed(() => authStore.user?.role)
</script>
