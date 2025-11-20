<template>
  <div class="container p-5 w-60 d-flex flex-column">
    <form>
      <div class="mb-3">
        <label for="name" class="form-label">Nombre</label>
        <input type="input" class="form-control" id="name" v-model="name" />
      </div>

      <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label">Email address</label>
        <input
          type="email"
          class="form-control"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          v-model="email"
        />
      </div>

      <div class="mb-3">
        <label for="exampleInputPassword1" class="form-label">Password</label>
        <input type="password" class="form-control" id="exampleInputPassword1" v-model="password" />
      </div>

      <div class="mb-3">
        <label for="role">Selecciona un rol:</label>

        <select
          class="form-select"
          aria-label="Selecciona un rol:"
          name="role"
          id="role"
          v-model="role"
        >
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary" @click.prevent="authUser">Submit</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import RegisterService from '@/services/RegisterService'
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const name = ref('')
const role = ref('')

const authUser = async () => {
  const register = new RegisterService()
  const success = await register.register(name.value, email.value, password.value, role.value)
  if (success) {
    alert('Exito')
  } else {
    alert('Fallo en algun lugar')
  }
}
</script>

<style scoped></style>
