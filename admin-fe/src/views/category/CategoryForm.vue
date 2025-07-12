<template>
    <div class="p-6 space-y-4 max-w-full mx-auto">
      <h1 class="text-2xl font-bold mb-4">
        {{ isEdit ? 'Edit Category' : 'Add New Category' }}
      </h1>
  
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block font-semibold">Name</label>
          <input v-model="form.name" class="w-full border p-2 rounded" required />
        </div>
  
        <div>
          <label class="block font-semibold">Slug</label>
          <input v-model="form.slug" class="w-full border p-2 rounded" />
        </div>
  
        <div>
          <label class="block font-semibold">Description</label>
          <textarea v-model="form.description" class="w-full border p-2 rounded" rows="3" />
        </div>
  
        <div class="flex gap-2">
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Save
          </button>
          <router-link to="/admin/categories" class="text-gray-600 hover:underline">
            Cancel
          </router-link>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  import { API_ENDPOINTS } from '@/config/api'
  
  export default {
    data() {
      return {
        form: {
          name: '',
          slug: '',
          description: ''
        },
        isEdit: false
      }
    },
    async mounted() {
      const id = this.$route.params.id
      if (id) {
        this.isEdit = true
        const res = await axios.get(`${API_ENDPOINTS.categories}/${id}`)
        this.form = res.data
      }
    },
    methods: {
      async handleSubmit() {
        const id = this.$route.params.id
        if (this.isEdit) {
          await axios.put(`${API_ENDPOINTS.categories}/${id}`, this.form)
        } else {
          await axios.post(API_ENDPOINTS.categories, this.form)
        }
        this.$router.push('/admin/categories')
      }
    }
  }
  </script>
  