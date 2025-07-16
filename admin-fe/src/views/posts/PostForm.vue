<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
    <!-- Konten Utama -->
    <div class="lg:col-span-2 space-y-4">
      <!-- Title -->
      <div>
        <label class="block font-semibold text-gray-700 mb-1">Title</label>
        <input
          v-model="form.title"
          @input="generateSlug"
          placeholder="Add Title"
          class="w-full text-4xl font-bold border-none focus:ring-0 placeholder-gray-400"
        />
      </div>

      <!-- Excerpt -->
      <div>
        <label class="block font-semibold text-gray-700 mb-1">Excerpt</label>
        <textarea
          v-model="form.excerpt"
          placeholder="Write an excerpt..."
          class="w-full text-sm text-gray-600 border border-dashed rounded p-3"
          rows="2"
        ></textarea>
      </div>

      <!-- Content -->
      <div class="bg-white border rounded shadow-sm p-4 space-y-2 min-h-[300px]">
        <label class="block font-semibold text-gray-700 mb-1">Content</label>
        <quill-editor
          v-model:content="form.content"
          contentType="html"
          class="min-h-[300px] bg-white border rounded"
        />
      </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-4">
      <!-- Publish -->
      <div class="bg-white border rounded shadow-sm p-4">
        <h3 class="font-semibold mb-2">Publish</h3>
        <label class="block text-sm font-medium mb-1">Status</label>
        <select v-model="form.status" class="w-full border p-2 rounded">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <!-- Featured Image -->
      <div class="bg-white border rounded shadow-sm p-4">
        <h3 class="font-semibold mb-2">Featured Image</h3>
        <button
          class="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
          @click="showMediaPicker = true"
        >
          Select Image
        </button>

        <div v-if="form.thumbnail_url" class="mt-3">
          <img
            :src="getImageUrl(form.thumbnail_url)"
            alt="Thumbnail"
            class="rounded shadow max-h-40 object-cover w-full"
          />
          <button
            @click="form.thumbnail_url = ''"
            class="mt-2 text-sm text-red-600 hover:underline"
          >
            Remove Image
          </button>
        </div>

        <MediaPickerModal
          :show="showMediaPicker"
          @close="showMediaPicker = false"
          @select="selectImage"
        />
      </div>

      <!-- Categories -->
      <div class="bg-white border rounded shadow-sm p-4">
        <h3 class="font-semibold mb-2">Categories</h3>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="flex items-center gap-2"
          >
            <input
              type="checkbox"
              :value="cat.id"
              v-model="form.category_ids"
            />
            <label class="text-sm">{{ cat.name }}</label>
          </div>
        </div>
      </div>

      <!-- SEO -->
      <div class="bg-white border rounded shadow-sm p-4">
        <h3 class="font-semibold mb-2">SEO</h3>
        <label class="block text-sm font-medium mb-1">Meta Title</label>
        <input
          v-model="seo.meta_title"
          placeholder="Meta Title"
          class="w-full p-2 border rounded mb-2"
        />
        <label class="block text-sm font-medium mb-1">Meta Description</label>
        <textarea
          v-model="seo.meta_description"
          placeholder="Meta Description"
          class="w-full p-2 border rounded"
          rows="2"
        ></textarea>
      </div>

      <!-- Save Button -->
      <div class="text-right">
        <button
          type="button"
          @click="savePost"
          class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
        >
          {{ isEdit ? 'Update' : 'Publish' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import axios from 'axios'
import { API_ENDPOINTS, API_URL } from '@/config/api'
import MediaPickerModal from '@/views/MediaPicker.vue'

export default {
  components: {
    MediaPickerModal,
    QuillEditor
  },
  data() {
    return {
      form: {
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        status: 'draft',
        thumbnail_url: '',
        website_id: 1,
        user_id: 1,
        category_ids: []
      },
      seo: {
        meta_title: '',
        meta_description: ''
      },
      categories: [],
      isEdit: false,
      showMediaPicker: false
    }
  },
  methods: {
    generateSlug() {
      this.form.slug = this.form.title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
    },
    getImageUrl(path) {
      return path.startsWith('http') ? path : `${API_URL}${path}`
    },
    selectImage(url) {
      console.log('Selected image:', url)
      this.form.thumbnail_url = url
      this.showMediaPicker = false
    },
    async fetchPost(id) {
      const res = await axios.get(`${API_ENDPOINTS.posts}/${id}`)
      const post = res.data

      this.form = {
        ...post,
        category_ids: post.categories?.map(c => c.id) || []
      }

      if (post.meta?.length > 0) {
        post.meta.forEach((m) => {
          if (m.meta_key === 'meta_title') this.seo.meta_title = m.meta_value
          if (m.meta_key === 'meta_description') this.seo.meta_description = m.meta_value
        })
      }

      this.isEdit = true
    },
    async fetchCategories() {
      const res = await axios.get(API_ENDPOINTS.categories)
      this.categories = res.data
    },
    async savePost() {
      const meta = [
        { meta_key: 'meta_title', meta_value: this.seo.meta_title },
        { meta_key: 'meta_description', meta_value: this.seo.meta_description }
      ]

      const payload = {
        ...this.form,
        type: 'post',
        meta
      }

      try {
        if (this.isEdit) {
          await axios.put(`${API_ENDPOINTS.posts}/${this.$route.params.id}`, payload)
        } else {
          await axios.post(API_ENDPOINTS.posts, payload)
        }
        this.$router.push('/admin/posts')
      } catch (err) {
        console.error('Failed to save post:', err)
      }
    }
  },
  async mounted() {
    await this.fetchCategories()
    if (this.$route.params.id) {
      await this.fetchPost(this.$route.params.id)
    }
  }
}
</script>
