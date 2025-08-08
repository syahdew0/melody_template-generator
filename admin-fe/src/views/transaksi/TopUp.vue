<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold mb-4">Manajemen Topup</h1>

    <!-- <div class="flex justify-between items-center mb-4">
      <select v-model="statusFilter" @change="fetchTopups" class="border px-4 py-2 rounded">
        <option value="">Semua</option>
        <option value="success">Sukses</option>
        <option value="pending">Pending</option>
        <option value="failed">Ditolak</option>
      </select>
    </div> -->
    <!-- Filter Area -->
    <div class="flex items-center gap-4 mb-4">
      <select v-model="statusFilter" @change="fetchTopups" class="border px-4 py-2 rounded">
        <option value="">Semua</option>
        <option value="success">Sukses</option>
        <option value="pending">Pending</option>
        <option value="failed">Ditolak</option>
      </select>

      <input
        v-model="usernameFilter"
        @input="fetchTopups"
        type="text"
        placeholder="Filter Username"
        class="border px-4 py-2 rounded"
      />
    </div>

    <div v-if="summary.length" class="mt-6">
    <h2 class="text-lg font-semibold mb-2">Summary Topup</h2>
    <table class="w-full table-auto border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border px-3 py-2">Status</th>
          <th class="border px-3 py-2">Total Nominal</th>
          <th class="border px-3 py-2">Jumlah Transaksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in summary" :key="item.status">
          <td class="border px-3 py-2 capitalize">{{ item.status }}</td>
          <td class="border px-3 py-2">
            Rp{{ Number(item.total_amount).toLocaleString('id-ID') }}
          </td>
          <td class="border px-3 py-2">{{ item.count }}</td>
        </tr>
      </tbody>
    </table>
  </div>

    <div v-if="loading">Memuat data...</div>

    <table v-else class="w-full table-auto border border-gray-300 text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-3 py-2">ID</th>
          <th class="border px-3 py-2">Tanggal</th>
          <th class="border px-3 py-2">Username</th>
          <th class="border px-3 py-2">Nominal</th>
          <th class="border px-3 py-2">Keterangan</th>
             <!-- <th class="border px-3 py-2">Bank</th> -->
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
          <td class="border px-3 py-2 italic text-gray-700">{{ topup.remarks || '-' }}</td>
           <!-- <td class="border px-3 py-2">
            <div v-if="topup.bank">
              <div class="font-semibold">{{ topup.bank.bank_name }}</div>
              <div class="text-xs">{{ topup.bank.account_name }} ({{ topup.bank.account_number }})</div>
            </div>
            <div v-else class="text-gray-400 italic">-</div>
          </td> -->
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
          <td colspan="8" class="text-center py-4 text-gray-500">Tidak ada data</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center items-center mt-6 space-x-2 text-sm">
      <button
        :disabled="currentPage === 1"
        @click="currentPage--; fetchTopups()"
        class="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        @click="changePage(page)"
        :class="[
          'px-3 py-1 border rounded',
          page === currentPage ? 'bg-blue-600 text-white' : 'bg-white'
        ]"
      >
        {{ page }}
      </button>

      <button
        :disabled="currentPage === totalPages"
        @click="currentPage++; fetchTopups()"
        class="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api.js'

const topups = ref([])
const loading = ref(false)
const statusFilter = ref('')
const summary = ref([])
const usernameFilter = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = 10

const fetchTopups = async () => {
  loading.value = true
  try {
    const res = await axios.get(API_ENDPOINTS.topup, {
      params: {
        status: statusFilter.value || undefined,
        username: usernameFilter.value || undefined,
        page: currentPage.value,
        limit: perPage
      }
    })

    const payload = res.data?.data || []
    topups.value = payload
    totalPages.value = res.data?.totalPages || 1

    const summaryRes = await axios.get(API_ENDPOINTS.summaryTopup, {
      params: {
        username: usernameFilter.value || undefined
      }
    })
    summary.value = Array.isArray(summaryRes.data) ? summaryRes.data : []
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
const changePage = (page) => {
  if (page !== currentPage.value) {
    currentPage.value = page
    fetchTopups()
  }
}

onMounted(
  fetchTopups)
</script>
