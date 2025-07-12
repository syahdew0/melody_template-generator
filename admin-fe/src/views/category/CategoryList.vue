<template>
    <div class="p-6 space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Categories</h1>
        <router-link
          to="/admin/categories/create"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add New
        </router-link>
      </div>
  
      <table class="w-full table-auto border bg-white">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 text-left">Name</th>
            <th class="p-2 text-left">Slug</th>
            <th class="p-2 text-left">Description</th>
            <th class="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="cat in categories"
            :key="cat.id"
            class="border-t hover:bg-gray-50 transition"
          >
            <td class="p-2">{{ cat.name }}</td>
            <td class="p-2">{{ cat.slug }}</td>
            <td class="p-2">{{ cat.description }}</td>
            <td class="p-2 text-right space-x-2">
              <router-link
                :to="`/admin/categories/${cat.id}`"
                class="text-blue-600 hover:underline"
              >
                Edit
              </router-link>
              <!-- <button
                @click="deleteCategory(cat.id)"
                class="text-red-600 hover:underline"
              >
                Delete
              </button> -->
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
        categories: []
      }
    },

    
    methods: {
      async fetchCategories() {
      const res = await axios.get(API_ENDPOINTS.categories)
      this.categories = res.data
    },
      async deleteCategory(id) {
        if (confirm('Yakin ingin menghapus kategori ini?')) {
          try {
            await axios.delete(`${API_ENDPOINTS.categories}/${id}`)
            this.fetchCategories()
          } catch (err) {
            alert(err.response?.data?.message || 'Gagal menghapus kategori.')
          }
        }
      }
    },
    mounted() {
      this.fetchCategories()
    }
  }
  </script>
  