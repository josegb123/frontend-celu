<template>
  <div>
    <h3>{{ store.count }} x 2 = {{ store.times2 }}</h3>
    <button @click="store.increment(1)">Incrementar</button>
    <button @click="store.decrement(1)">Decrementar</button>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from '@/store/counterStore'

const store = useCounterStore()
</script>
