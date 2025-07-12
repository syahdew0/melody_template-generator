<template>
    <div class="p-6 max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">Category Manager</h2>
  
      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="mb-6 space-y-4">
        <input v-model="form.name" placeholder="Category Name" class="w-full border p-2 rounded" required />
        <input v-model="form.slug" placeholder="Slug" class="w-full border p-2 rounded" />
        <textarea v-model="form.description" placeholder="Description" class="w-full border p-2 rounded"></textarea>
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">
          {{ isEdit ? 'Update' : 'Add Category' }}
        </button>
      </form>
  
      <!-- Table -->
      <table class="w-full table-auto border">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2 text-left">Name</th>
            <th class="px-4 py-2 text-left">Slug</th>
            <th class="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.id">
            <td class="px-4 py-2">{{ cat.name }}</td>
            <td class="px-4 py-2">{{ cat.slug }}</td>
            <td class="px-4 py-2 space-x-2 text-center">
              <button @click="editCategory(cat)" class="text-blue-600 hover:underline">Edit</button>
              <button @click="deleteCategory(cat.id)" class="text-red-600 hover:underline">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  import { API_ENDPOINTS } from '@/config/api'
  
  export default {
    data() {
      return {
        categories: [],
        form: {
          name: '',
          slug: '',
          description: ''
        },
        isEdit: false,
        editId: null
      }
    },
    mounted() {
      this.fetchCategories()
    },
    methods: {
      async fetchCategories() {
        const res = await axios.get(API_ENDPOINTS.categories)
        this.categories = res.data
      },
      async handleSubmit() {
        if (this.isEdit) {
          await axios.put(`${API_ENDPOINTS.categories}/${this.editId}`, this.form)
        } else {
          await axios.post(API_ENDPOINTS.categories, this.form)
        }
        this.resetForm()
        this.fetchCategories()
      },
      editCategory(cat) {
        this.form = { ...cat }
        this.isEdit = true
        this.editId = cat.id
      },
      async deleteCategory(id) {
        if (confirm('Delete this category?')) {
          await axios.delete(`${API_ENDPOINTS.categories}/${id}`)
          this.fetchCategories()
        }
      },
      resetForm() {
        this.form = { name: '', slug: '', description: '' }
        this.isEdit = false
        this.editId = null
      }
    }
  }
  </script>
  