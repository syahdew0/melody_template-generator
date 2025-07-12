<template>
  <div class="space-y-4 px-6 py-12">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-800">Testimonial</h1>
      <router-link
        to="/admin/testimonials/new"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
      >
        + Tambah Baru
      </router-link>
    </div>

    <div class="bg-white shadow border rounded-md overflow-hidden">
      <table class="min-w-full text-sm table-auto">
        <thead class="bg-gray-100 border-b">
          <tr class="text-left text-gray-700">
            <th class="px-4 py-3 w-12">
              <input type="checkbox" />
            </th>
            <th class="px-4 py-3">Judul</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Dibuat</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in testimonials"
            :key="item.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="px-4 py-3">
              <input type="checkbox" />
            </td>
            <td class="px-4 py-3 text-blue-600 font-medium">
              {{ item.title }}
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-800': item.status === 'published',
                  'bg-yellow-100 text-yellow-800': item.status === 'draft'
                }"
              >
                {{ item.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">
              {{ formatDate(item.createdAt) }}
            </td>
            <td class="px-4 py-3 text-right">
              <router-link
                :to="`/admin/testimonials/${item.id}`"
                class="text-blue-600 hover:underline text-sm mr-3"
              >
                Edit
              </router-link>
              <button
                @click="remove(item.id)"
                class="text-red-600 hover:underline text-sm"
              >
                Hapus
              </button>
            </td>
          </tr>
          <tr v-if="testimonials.length === 0">
            <td colspan="5" class="px-4 py-6 text-center text-gray-400">
              Tidak ada testimonial ditemukan.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PAGINATION -->
    <div class="mt-4 flex justify-between items-center">
      <div class="text-sm text-gray-600">
        Menampilkan halaman {{ page }} dari {{ totalPages }}
      </div>
      <div class="space-x-1">
        <button
          class="px-3 py-1 bg-gray-200 rounded"
          :disabled="page === 1"
          @click="page--"
        >
          Prev
        </button>
        <button
          class="px-3 py-1 bg-gray-200 rounded"
          :disabled="page === totalPages"
          @click="page++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const testimonials = ref([])
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)

const fetchTestimonials = async () => {
  try {
    const res = await axios.get(`${API_ENDPOINTS.posts}?type=testimonial&page=${page.value}&limit=${limit.value}`)
    testimonials.value = res.data.data
    const totalItems = res.data.total || 0
    totalPages.value = Math.ceil(totalItems / limit.value)
  } catch (err) {
    console.error('Error fetching testimonials:', err)
  }
}

const remove = async (id) => {
  if (!confirm('Yakin ingin menghapus testimonial ini?')) return
  try {
    await axios.delete(`${API_ENDPOINTS.posts}/${id}`)
    await fetchTestimonials()
  } catch (err) {
    console.error('Error deleting testimonial:', err)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(fetchTestimonials)
watch(page, fetchTestimonials)
</script>
