import type { IPost } from '@/interfaces/IPost'
import { ref, type Ref } from 'vue'

const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000
class PostService {
  private posts: Ref<Array<IPost>>
  private post: Ref<IPost>

  constructor() {
    this.posts = ref<Array<IPost>>([])
    this.post = ref<IPost>({})
  }

  getPosts(): Ref<Array<IPost>> {
    return this.posts
  }

  getPost(): Ref<IPost> {
    return this.post
  }

  async fetchPostById(id?: string | Array<string>): Promise<void> {
    const url = `https://jsonplaceholder.typicode.com/posts/${id}`

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Fallo en la solicitud: Estado HTTP ${response.status}`)
        }

        const json: IPost = await response.json()
        this.post.value = json

        return
      } catch {
        if (attempt === MAX_RETRIES) {
          console.error(
            'El número máximo de reintentos fue alcanzado. La solicitud falló permanentemente.',
          )
          throw new Error(`Fallo al obtener post ${id} después de varios reintentos.`)
        }

        const waitTime = Math.pow(2, attempt - 1) * BASE_DELAY_MS
        await this.delay(waitTime)
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async fetchPosts(): Promise<void> {
    const url = 'https://jsonplaceholder.typicode.com/posts'

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Fallo en la solicitud: Estado HTTP ${response.status}`)
        }

        const json: IPost[] = await response.json()
        this.posts.value = json

        return
      } catch {
        if (attempt === MAX_RETRIES) {
          throw new Error('Fallo al obtener posts después de varios reintentos.')
        }

        const waitTime = Math.pow(2, attempt - 1) * BASE_DELAY_MS
        await this.delay(waitTime)
      }
    }
  }
}

export default PostService
