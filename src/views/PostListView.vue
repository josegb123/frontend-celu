<template>
  <div class="container mb-2">
    <ul v-if="posts">
      <li v-for="post in posts" :key="post.id" class="shadow card m-3 p-3">
        <div class="card-body">
          <RouterLink
            :to="{ name: 'PostDetail', params: { id: post.id } }"
            class="h2 text-decoration-none"
          >
            {{ post.title }}
          </RouterLink>
        </div>
      </li>
    </ul>
    <div v-else>
      <div class="spinner-border"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import PostService from '@/services/PostService.ts'

export default defineComponent({
  name: 'PostListView',
  setup() {
    const service = new PostService()
    const posts = service.getPosts()

    onMounted(async () => {
      service.fetchPosts()
    })
    return { posts }
  },
})
</script>

<style scoped></style>
