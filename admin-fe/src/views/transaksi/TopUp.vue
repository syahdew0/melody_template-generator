<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold mb-4">Manajemen Topup</h1>

    <!-- Filter Area -->
    <div class="flex flex-wrap items-center gap-4 mb-4 max-w-full">
      <select v-model="statusFilter" class="border px-4 py-2 rounded">
        <option value="">Semua</option>
        <option value="success">Sukses</option>
        <option value="pending">Pending</option>
        <option value="failed">Ditolak</option>
      </select>

      <input
        type="date"
        v-model="fromDateFilter"
        class="border px-4 py-2 rounded"
      />

      <input
        type="date"
        v-model="toDateFilter"
        class="border px-4 py-2 rounded"
      />

      <input
        v-model="usernameFilter"
        type="text"
        placeholder="Filter Username"
        class="border px-4 py-2 rounded flex-grow min-w-[200px]"
      />

      <button
        @click="handleFilter"
        class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Cari
      </button>
    </div>

    <div v-if="!isSearched" class="text-center py-8 text-gray-500">
      Silakan pilih filter dan klik tombol Cari untuk menampilkan data.
    </div>

    <div v-else>
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
            <th class="border px-3 py-2">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll($event.target.checked)"
              />
            </th>
            <th class="border px-3 py-2">ID</th>
            <th class="border px-3 py-2">Tanggal</th>
            <th class="border px-3 py-2">Username</th>
            <th class="border px-3 py-2">Nominal</th>
            <th class="border px-3 py-2">Keterangan</th>
            <th class="border px-3 py-2">Status</th>
            <th class="border px-3 py-2">Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="topup in topups"
            :key="topup.id"
            :class="{ 'bg-yellow-50': selectedTopupIds.has(topup.id) }"
          >
            <td class="border px-3 py-2 text-center">
              <input
                type="checkbox"
                :disabled="topup.status !== 'pending'"
                :checked="selectedTopupIds.has(topup.id)"
                @change="toggleSelection(topup.id, $event.target.checked)"
              />
            </td>
            <td class="border px-3 py-2">{{ topup.id }}</td>
            <td class="border px-3 py-2">{{ formatDate(topup.createdon) }}</td>
            <td class="border px-3 py-2">{{ topup.username }}</td>
            <td class="border px-3 py-2">
              Rp{{ Number(topup.amount).toLocaleString('id-ID') }}
            </td>
            <td class="border px-3 py-2 italic text-gray-700">
              {{ topup.remarks || '-' }}
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
            <td colspan="8" class="text-center py-4 text-gray-500">Tidak ada data</td>
          </tr>
        </tbody>
      </table>

      <div v-if="selectedTopupIds.size > 0" class="mt-4 space-x-2">
        <button
          @click="bulkUpdateStatus('success')"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Setujui Semua ({{ selectedTopupIds.size }})
        </button>
        <button
          @click="bulkUpdateStatus('failed')"
          class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Tolak Semua ({{ selectedTopupIds.size }})
        </button>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages >= 1"
        class="flex justify-center items-center mt-6 space-x-2 text-sm"
      >
        <button
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
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
            page === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700',
          ]"
        >
          {{ page }}
        </button>

        <button
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api.js'

const topups = ref([])
const loading = ref(false)
const statusFilter = ref('')
const summary = ref([])
const usernameFilter = ref('')
const currentPage = ref(1)
const totalPages = ref(1)

const fromDateFilter = ref('')
const toDateFilter = ref('')
const isSearched = ref(false)

const selectedTopupIds = ref(new Set())

const fetchTopups = async () => {
  loading.value = true
  try {
    const params = {
      status: statusFilter.value || undefined,
      username: usernameFilter.value || undefined,
      fromDate: fromDateFilter.value || undefined,
      toDate: toDateFilter.value || undefined,
      page: currentPage.value,
      limit: 10,
    }

    const res = await axios.get(API_ENDPOINTS.topup.list, { params })

    topups.value = res.data?.data || []
    totalPages.value = res.data?.totalPages || 1

    const summaryRes = await axios.get(API_ENDPOINTS.topup.summary, {
  params: {
    username: usernameFilter.value || undefined,
    fromDate: fromDateFilter.value || undefined,
    toDate: toDateFilter.value || undefined,
  },
})
    summary.value = Array.isArray(summaryRes.data) ? summaryRes.data : []

    selectedTopupIds.value.clear()
  } catch (err) {
    console.error('Gagal mengambil data topup:', err)
    topups.value = []
  } finally {
    loading.value = false
  }
}

const updateStatus = async (id, status) => {
  const confirmMsg =
    status === 'success'
      ? 'Apakah Anda yakin ingin menyetujui topup ini?'
      : 'Apakah Anda yakin ingin menolak topup ini?'

  if (!confirm(confirmMsg)) return

  try {
    const token = localStorage.getItem('adminToken')
    await axios.put(
      `${API_ENDPOINTS.topup.byId(id)}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } } 
    )
    await fetchTopups()
  } catch (err) {
    console.error('Gagal update status:', err)
    alert('Gagal memperbarui status topup')
  }
}


const toggleSelection = (id, checked) => {
  if (checked) {
    selectedTopupIds.value.add(id)
  } else {
    selectedTopupIds.value.delete(id)
  }
}

const toggleSelectAll = (checked) => {
  if (checked) {
    topups.value.forEach((topup) => {
      if (topup.status === 'pending') selectedTopupIds.value.add(topup.id)
    })
  } else {
    selectedTopupIds.value.clear()
  }
}

const allSelected = computed(() => {
  const pendingIds = topups.value
    .filter((topup) => topup.status === 'pending')
    .map((t) => t.id)
  return pendingIds.length > 0 && pendingIds.every((id) => selectedTopupIds.value.has(id))
})

const bulkUpdateStatus = async (status) => {
  const confirmMsg =
    status === 'success'
      ? `Apakah Anda yakin ingin menyetujui semua topup yang dipilih?`
      : `Apakah Anda yakin ingin menolak semua topup yang dipilih?`

  if (!confirm(confirmMsg)) return

  try {
    const token = localStorage.getItem('adminToken') 
    await axios.put(
      API_ENDPOINTS.topup.bulkUpdateStatus(),
      { ids: Array.from(selectedTopupIds.value), status },
      { headers: { Authorization: `Bearer ${token}` } } 
    )
    await fetchTopups()
  } catch (err) {
    console.error('Gagal update status bulk:', err)
    alert('Gagal memperbarui status topup secara massal')
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

const handleFilter = () => {
  currentPage.value = 1
  isSearched.value = true
  fetchTopups()
}

onMounted(() => {
  const today = new Date().toISOString().slice(0, 10)
  fromDateFilter.value = today
  toDateFilter.value = today

  // jangan otomatis fetch, tunggu klik tombol Cari
})
</script>
