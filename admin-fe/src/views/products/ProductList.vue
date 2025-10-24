<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Products</h1>
      <router-link 
        v-if="permissions.canAdd" 
        :to="{ name: 'ProductCreate' }" 
        class="btn-primary"
      >
        Add New
      </router-link>
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
    <div v-if="permissions.canDelete && selectedIds.length" class="text-sm text-red-600">
      {{ selectedIds.length }} selected.
      <button @click="bulkDelete" class="text-red-600 underline ml-2">Delete Selected</button>
    </div>

    <!-- Table -->
    <div class="overflow-auto border rounded" v-if="permissions.canView && items.length">
      <table class="min-w-full table-auto">
        <thead class="bg-gray-100 text-left">
          <tr>
            <th class="px-4 py-2">
              <input type="checkbox" @change="toggleAll" :checked="isAllSelected" />
            </th>
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
            <td class="px-4 py-2">{{ formatCurrency(item.product_detail?.price) }}</td>
            <td class="px-4 py-2">{{ item.product_detail?.stock ?? '-' }}</td>
            <td class="px-4 py-2 text-right space-x-2">
              <router-link
                v-if="permissions.canEdit"
                :to="{ name: 'ProductEdit', params: { id: item.id } }"
                class="text-blue-600 hover:underline"
              >
                Edit
              </router-link>
              <button
                v-if="permissions.canDelete"
                @click="confirmDelete(item.id)"
                class="text-red-600 hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-6 text-gray-500">
      {{ permissions.canView ? 'No products found.' : 'Anda tidak memiliki izin untuk melihat produk.' }}
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
import { ref, computed, onMounted, watch } from 'vue'
import { api, API_ENDPOINTS } from '@/config/api'

const items = ref([])
const page = ref(1)
const limit = 10
const search = ref('')
const statusFilter = ref('')
const selectedIds = ref([])
const sort = ref('title')
const sortDir = ref('asc')
const hasNextPage = ref(false)
const permissions = ref({
  canView: false,
  canEdit: false,
  canAdd: false,
  canDelete: false
})

const formatCurrency = (value) => value ? 'Rp ' + Number(value).toLocaleString('id-ID') : '-'

const fetchData = async () => {
  if (!permissions.value.canView) return
  try {
    const params = {
      type: 'product',
      page: page.value,
      limit,
      search: search.value
    }

    // Hanya tambahkan status jika ada filter dipilih
    if (statusFilter.value) {
      params.status = statusFilter.value
    }

    const { data } = await api.get(API_ENDPOINTS.posts, { params })
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
  selectedIds.value = isAllSelected.value ? [] : items.value.map(i => i.id)
}

const isAllSelected = computed(() => selectedIds.value.length === items.value.length)

const prevPage = () => { if (page.value > 1) { page.value--; fetchData() } }
const nextPage = () => { page.value++; fetchData() }

const confirmDelete = async (id) => {
  if (!permissions.value.canDelete) return
  if (confirm('Delete this product?')) {
    try {
      await api.delete(`${API_ENDPOINTS.posts}/${id}`)
      alert('Product deleted successfully')
      fetchData()
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message)
      alert('Error deleting product: ' + (err.response?.data?.message || 'Internal Server Error'))
    }
  }
}

const bulkDelete = async () => {
  if (!permissions.value.canDelete || !selectedIds.value.length) return
  if (confirm('Delete selected products?')) {
    try {
      await Promise.all(selectedIds.value.map(id => api.delete(`${API_ENDPOINTS.posts}/${id}`)))
      alert('Selected products deleted successfully')
      selectedIds.value = []
      fetchData()
    } catch (err) {
      console.error('Bulk delete error:', err.response?.data || err.message)
      alert('Error deleting selected products: ' + (err.response?.data?.message || 'Internal Server Error'))
    }
  }
}

const fetchPermissions = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.userPermissions)
    const productKey = Object.keys(res.data).find(k => k.toLowerCase() === 'product')
    permissions.value = productKey
      ? res.data[productKey]
      : { canView: false, canEdit: false, canAdd: false, canDelete: false }
  } catch (err) {
    console.error('Gagal fetch permissions:', err)
    permissions.value = { canView: false, canEdit: false, canAdd: false, canDelete: false }
  }
}

watch([search, statusFilter], () => { page.value = 1; fetchData() })

onMounted(async () => {
  await fetchPermissions()
  fetchData()
})
</script>

<style scoped>
.btn-primary { @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 }
.btn-secondary { @apply bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 }
</style>
