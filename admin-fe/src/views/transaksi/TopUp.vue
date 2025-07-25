<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold mb-4">Manajemen Topup</h1>

    <div class="flex justify-between items-center mb-4">
      <select v-model="statusFilter" @change="fetchTopups" class="border px-4 py-2 rounded">
        <option value="">Semua</option>
        <option value="success">Sukses</option>
        <option value="pending">Pending</option>
        <option value="failed">Ditolak</option>
      </select>
    </div>

    <div v-if="loading">Memuat data...</div>

    <table v-else class="w-full table-auto border border-gray-300 text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-3 py-2">ID</th>
          <th class="border px-3 py-2">Tanggal</th>
          <th class="border px-3 py-2">Username</th>
          <th class="border px-3 py-2">Nominal</th>
          <th class="border px-3 py-2">Status</th>
          <th class="border px-3 py-2">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="topup in topups" :key="topup.id">
          <td class="border px-3 py-2">{{ topup.id }}</td>
          <td class="border px-3 py-2">{{ formatDate(topup.createdon) }}</td>
          <td class="border px-3 py-2">{{ topup.username }}</td>
          <td class="border px-3 py-2">
            Rp{{ Number(topup.amount).toLocaleString('id-ID') }}
          </td>
          <td class="border px-3 py-2 capitalize">{{ topup.status }}</td>
          <td class="border px-3 py-2 space-x-2">
            <button
              v-if="topup.status === 'pending'"
              @click="updateStatus(topup.id, 'success')"
              class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Setujui
            </button>
            <button
              v-if="topup.status === 'pending'"
              @click="updateStatus(topup.id, 'failed')"
              class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Tolak
            </button>
          </td>
        </tr>
        <tr v-if="!loading && topups.length === 0">
          <td colspan="6" class="text-center py-4 text-gray-500">Tidak ada data</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api.js'

const topups = ref([])
const loading = ref(false)
const statusFilter = ref('')

const fetchTopups = async () => {
  loading.value = true
  try {
    const res = await axios.get(API_ENDPOINTS.topup, {
      params: {
        status: statusFilter.value || undefined
      }
    })

    // BE kamu jelas mengembalikan array langsung, bukan { data: [...] }
    const payload = Array.isArray(res.data) ? res.data : res.data.data
    topups.value = payload ?? []
    // console.log('payload topups', topups.value)
  } catch (err) {
    console.error('Gagal mengambil data topup:', err)
    topups.value = []
  } finally {
    loading.value = false
  }
}

const updateStatus = async (id, status) => {
  try {
    // route backend kamu: PUT /apis/transaksi/topup/:id/status
    await axios.put(`${API_ENDPOINTS.topupById(id)}/status`, { status })
    await fetchTopups()
  } catch (err) {
    console.error('Gagal update status:', err)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID') + ' ' + date.toLocaleTimeString('id-ID')
}

onMounted(fetchTopups)
</script>
