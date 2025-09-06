<template>
  <div class="flex flex-col lg:flex-row gap-6 p-6">
    <!-- Main Content -->
    <div class="flex-1 space-y-4">
      <label>Title</label>
      <input v-model="form.title" @input="generateSlug" class="w-full text-4xl font-bold" />

      <label>Content</label>
      <quill-editor v-model="form.content" class="h-[400px] bg-white border rounded" />

      <label>Excerpt</label>
      <textarea v-model="form.excerpt" rows="3" class="w-full p-3 border rounded bg-gray-50"></textarea>
    </div>

    <!-- Sidebar -->
    <div class="w-full lg:w-1/3 space-y-4">
      <!-- Publish -->
      <div class="border rounded bg-white shadow p-4 space-y-3">
        <select v-model="form.status" class="w-full border p-2 rounded">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button @click="savePage" class="w-full bg-blue-600 text-white p-2 rounded">
          {{ isEdit ? 'Update' : 'Publish' }}
        </button>
      </div>

      <!-- Category -->
      <div class="border rounded bg-white shadow p-4">
        <label>Category</label>
        <div v-for="cat in categories" :key="cat.id" class="flex items-center space-x-2 mt-1">
          <input type="checkbox" :value="cat.id" v-model="form.category_ids" />
          <span>{{ cat.name }}</span>
        </div>
      </div>

      <!-- Slug -->
      <div class="border rounded bg-white shadow p-4">
        <label>Permalink</label>
        <input v-model="form.slug" class="w-full border p-2 rounded" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { QuillEditor } from '@vueup/vue-quill'
import { API_ENDPOINTS } from '@/config/api'

const route = useRoute()
const router = useRouter()

const isEdit = !!route.params.slug
const form = ref({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  status: 'draft',
  type: 'page',
  website_id: 1,
  user_id: 1,
  category_ids: []
})
const categories = ref([])

// Slug generator
const generateSlug = () => {
  form.value.slug = form.value.title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

// Fetch page data if edit
const fetchPageBySlug = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.pageBySlug(route.params.slug))
    form.value = { ...form.value, ...res.data }
  } catch (err) {
    console.error(err)
  }
}

// Fetch categories
const fetchCategories = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.categories)
    categories.value = res.data
  } catch (err) {
    console.error(err)
  }
}

// Save page
const savePage = async () => {
  try {
    if (!form.value.category_ids.length) {
      alert('Harap pilih category terlebih dahulu!')
      return
    }

    const payload = {
      ...form.value,
      categoryId: form.value.category_ids // bisa dikirim array atau pertama saja
    }

    if (isEdit) {
      await axios.put(`${API_ENDPOINTS.pages}/slug/${form.value.slug}`, payload)
    } else {
      await axios.post(API_ENDPOINTS.posts, payload)
    }

    router.push('/admin/pages')
  } catch (err) {
    console.error(err)
  }
}

onMounted(async () => {
  await fetchCategories()
  if (isEdit) await fetchPageBySlug()
})
</script>
