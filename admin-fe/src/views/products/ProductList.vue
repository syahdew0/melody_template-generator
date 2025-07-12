<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Products</h1>
      <router-link :to="{ name: 'ProductCreate' }" class="btn-primary">Add New</router-link>
    </div>

      <!-- Search and filter-->
      <div class="flex flex-wrap gap-4 items-center">
        <input
          v-model="search"
          placeholder="Search posts..."
          class="border w-2/3 max-w-xl p-2 rounded"
        />
        <select
          v-model="statusFilter"
          class="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

    <!-- Bulk Actions -->
    <div v-if="selectedIds.length" class="text-sm text-red-600">
      {{ selectedIds.length }} selected.
      <button @click="bulkDelete" class="text-red-600 underline ml-2">Delete Selected</button>
    </div>

    <!-- Table -->
    <div class="overflow-auto border rounded">
      <table class="min-w-full table-auto">
        <thead class="bg-gray-100 text-left">
          <tr>
            <th class="px-4 py-2"><input type="checkbox" @change="toggleAll" :checked="isAllSelected" /></th>
            <th class="px-4 py-2 cursor-pointer" @click="toggleSort('title')">Title</th>
            <th class="px-4 py-2">Status</th>
            <th class="px-4 py-2">Price</th>
            <th class="px-4 py-2">Stock</th>
            <th class="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="border-t">
            <td class="px-4 py-2">
              <input type="checkbox" :value="item.id" v-model="selectedIds" />
            </td>
            <td class="px-4 py-2">{{ item.title }}</td>
            <td class="px-4 py-2">{{ item.status }}</td>
            <td class="px-4 py-2">Rp {{ item.product_detail?.price?.toLocaleString() || '-' }}</td>
            <td class="px-4 py-2">{{ item.product_detail?.stock ?? '-' }}</td>
            <td class="px-4 py-2 text-right space-x-2">
              <router-link :to="{ name: 'ProductEdit', params: { id: item.id } }" class="text-blue-600 hover:underline">Edit</router-link>
              <button @click="confirmDelete(item.id)" class="text-red-600 hover:underline">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-4">
      <button @click="prevPage" :disabled="page === 1" class="btn-secondary">Previous</button>
      <span>Page {{ page }}</span>
      <button @click="nextPage" :disabled="!hasNextPage" class="btn-secondary">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const items = ref([])
const page = ref(1)
const limit = 10
const search = ref('')
const statusFilter = ref('')
const selectedIds = ref([])
const sort = ref('title')
const sortDir = ref('asc')
const hasNextPage = ref(false)

const fetchData = async () => {
  try {
    console.log('FETCH PARAMS', {
      page: page.value,
      limit,
      search: search.value,
      status: statusFilter.value,
      type: 'product'
    })

    const { data } = await axios.get(API_ENDPOINTS.posts, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      params: {
        type: 'product',
        page: page.value,
        limit,
        search: search.value,
        status: statusFilter.value
      }
    })

    items.value = data.data || []
    hasNextPage.value = page.value * limit < data.total
  } catch (err) {
    console.error('FETCH ERROR', err)
  }
}

const toggleSort = (key) => {
  if (sort.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value = key
    sortDir.value = 'asc'
  }
  fetchData()
}

const toggleAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = items.value.map(i => i.id)
  }
}

const isAllSelected = computed(() => selectedIds.value.length === items.value.length)

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchData()
  }
}
const nextPage = () => {
  page.value++
  fetchData()
}

const confirmDelete = async (id) => {
  if (confirm('Delete this product?')) {
    await axios.delete(`${API_ENDPOINTS.posts}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    fetchData()
  }
}
watch([search, statusFilter], () => {
  page.value = 1
  fetchData()
})


const bulkDelete = async () => {
  if (confirm('Delete selected products?')) {
    await Promise.all(
      selectedIds.value.map(id =>
        axios.delete(`${API_ENDPOINTS.posts}/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      )
    )
    selectedIds.value = []
    fetchData()
  }
}

onMounted(fetchData)
</script>

<style scoped>
.input {
  @apply px-3 py-2 border rounded-md;
}
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700;
}
.btn-secondary {
  @apply bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300;
}
</style>
