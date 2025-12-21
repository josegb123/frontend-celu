<template>
  <div class="container py-4">
    <div class="row mb-5 mt-2">
      <div class="col-12 text-center text-md-start">
        <h1 class="display-5 fw-bold text-gradient">Panel de Ventas</h1>
        <p class="text-muted fs-5">Bienvenido de nuevo, {{ authStore.user?.name || 'Vendedor' }}</p>
      </div>
    </div>

    <div class="row g-4 justify-content-center">
      <div class="col-12 col-sm-6 col-lg-4">
        <router-link :to="{ name: 'pos' }" class="menu-card primary-gradient h-100 shadow-lg">
          <div class="card-content">
            <i class="bi bi-calculator-fill fs-1 mb-3"></i>
            <h3 class="fw-bold">Punto de Venta</h3>
            <p class="small opacity-75">Registrar ventas rápidamente</p>
          </div>
        </router-link>
      </div>

      <div class="col-6 col-md-4 col-lg-3">
        <router-link :to="{ name: 'ventas' }" class="menu-card secondary-card h-100 shadow">
          <div class="card-content">
            <i class="bi bi-receipt-cutoff fs-2 mb-2"></i>
            <h5 class="fw-bold">Historial de Ventas</h5>
          </div>
        </router-link>
      </div>

      <div class="col-6 col-md-4 col-lg-3">
        <router-link :to="{ name: 'Clientes' }" class="menu-card secondary-card h-100 shadow">
          <div class="card-content">
            <i class="bi bi-people-fill fs-2 mb-2"></i>
            <h5 class="fw-bold">Clientes</h5>
          </div>
        </router-link>
      </div>

      <div class="col-6 col-md-4 col-lg-3">
        <router-link :to="{ name: 'cuentas' }" class="menu-card warning-card h-100 shadow">
          <div class="card-content">
            <i class="bi bi-piggy-bank-fill fs-2 mb-2"></i>
            <h5 class="fw-bold text-center">Cuentas por cobrar</h5>
          </div>
        </router-link>
      </div>

      <div class="col-6 col-md-4 col-lg-3">
        <router-link :to="{ name: 'notificaciones' }" class="menu-card info-card h-100 shadow">
          <div class="card-content">
            <i class="bi bi-bell-fill fs-2 mb-2"></i>
            <h5 class="fw-bold">Notificaciones</h5>
          </div>
        </router-link>
      </div>

      <div class="col-6 col-md-4 col-lg-3">
        <router-link :to="{ name: 'Config' }" class="menu-card dark-card h-100 shadow border">
          <div class="card-content">
            <i class="bi bi-gear-fill fs-2 mb-2"></i>
            <h5 class="fw-bold">Ajustes</h5>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/authStore'

const authStore = useAuthStore()
</script>

<style scoped>
/* Estilo Base de las Tarjetas */
.menu-card {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  padding: 1.5rem;
  border-radius: 1.25rem;
  color: white;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: none;
  position: relative;
  overflow: hidden;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

/* Animación Hover */
.menu-card:hover {
  transform: translateY(-8px) scale(1.02);
  color: white;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3) !important;
}

.menu-card:active {
  transform: scale(0.95);
}

/* Colores Rellenos (Filled) */
.primary-gradient {
  background: linear-gradient(135deg, #0d6efd 0%, #0043a8 100%);
}

.secondary-card {
  background: #6c757d;
}

.danger-card {
  background: #dc3545;
}

.warning-card {
  background: #ffc107;
  color: #212529 !important; /* Texto oscuro para contraste con amarillo */
}

.info-card {
  background: #0dcaf0;
  color: #212529 !important;
}

.dark-card {
  background: #212529;
}

/* Efecto de Brillo */
.menu-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

.menu-card:hover::after {
  opacity: 1;
}

/* Gradiente de Texto para el Titulo Principal */
.text-gradient {
  background: linear-gradient(90deg, #0d6efd, #0dcaf0);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Responsividad para móviles (2 columnas en sm) */
@media (max-width: 576px) {
  .menu-card {
    padding: 1rem;
  }
  .menu-card i {
    font-size: 1.5rem !important;
  }
  .menu-card h5 {
    font-size: 0.9rem;
  }
}
</style>
