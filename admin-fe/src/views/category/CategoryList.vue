<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Categories</h1>
      <router-link
        to="/admin/categories/create"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Add New
      </router-link>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="w-full table-auto">
        <thead class="bg-gray-100 text-sm text-gray-700 uppercase">
          <tr>
            <th class="p-3 text-left">Name</th>
            <th class="p-3 text-left">Parent</th>
            <th class="p-3 text-left">Slug</th>
            <th class="p-3 text-left">Display In</th>
            <th class="p-3 text-left">Description</th>
            <th class="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="cat in categories"
            :key="cat.id"
            class="border-t hover:bg-gray-50 transition"
          >
            <td class="p-3 font-medium text-gray-800">
              {{ cat.name }}
            </td>

            <!-- Parent Category -->
            <td class="p-3 text-gray-600">
              {{ getParentName(cat.parent_id) || '—' }}
            </td>

            <!-- Slug -->
            <td class="p-3 text-gray-600">
              {{ cat.slug }}
            </td>

            <!-- Display In -->
            <td class="p-3">
              <span
                v-if="cat.post_type"
                class="px-2 py-1 text-xs rounded font-medium"
                :class="{
                  'bg-blue-100 text-blue-700': cat.post_type.name === 'post',
                  'bg-green-100 text-green-700': cat.post_type.name === 'product',
                  'bg-purple-100 text-purple-700': cat.post_type.name === 'both'
                }"
              >
                {{ cat.post_type.name }}
              </span>
              <span v-else class="text-gray-400">—</span>
            </td>

            <!-- Description -->
            <td class="p-3 text-gray-600 truncate max-w-xs">
              {{ cat.description || '-' }}
            </td>

            <!-- Actions -->
            <td class="p-3 text-right space-x-2">
              <router-link
                :to="`/admin/categories/${cat.id}`"
                class="text-blue-600 hover:underline"
              >
                Edit
              </router-link>

              <button
                @click="deleteCategory(cat.id)"
                class="text-red-600 hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>

          <tr v-if="categories.length === 0">
            <td colspan="6" class="p-6 text-center text-gray-500">
              No categories found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

export default {
  data() {
    return {
      categories: [],
      parentMap: {}
    }
  },
  methods: {
    async fetchCategories() {
      const res = await axios.get(API_ENDPOINTS.categories)
      this.categories = res.data

      // Buat map untuk parent name lookup
      this.parentMap = {}
      this.categories.forEach(cat => {
        this.parentMap[cat.id] = cat.name
      })
    },

    getParentName(id) {
      return this.parentMap[id]
    },

    formatDisplayIn(value) {
      switch (value) {
        case 'post':
          return 'Post'
        case 'product':
          return 'Product'
        case 'both':
          return 'Post & Product'
        default:
          return '—'
      }
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
