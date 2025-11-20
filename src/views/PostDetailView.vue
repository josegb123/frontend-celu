<template>
  <div class="container d-flex justify-content-center p-3 m-3">
    <div v-if="post && post.id">
      <h2>{{ post.title }}</h2>
      <p>{{ post.body }}</p>
    </div>
    <div v-else>
      <div class="spinner-border"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PostService from '@/services/PostService'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const service = new PostService()
const post = service.getPost()

onMounted(async () => {
  const route = useRoute()
  const postId = route.params.id
  await service.fetchPostById(postId)
})
</script>

<style scoped></style>
