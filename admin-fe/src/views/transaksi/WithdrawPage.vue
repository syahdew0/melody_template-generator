<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold mb-4">Manajemen Withdraw</h1>

    <div class="flex items-center gap-4 mb-4">
      <select v-model="statusFilter" @change="fetchWithdraws" class="border px-4 py-2 rounded">
        <option value="">Semua</option>
        <option value="pending">Pending</option>
        <option value="success">Disetujui</option>
        <option value="failed">Ditolak</option>
      </select>

      <input
        v-model="usernameFilter"
        @keyup.enter="fetchWithdraws"
        placeholder="Filter username"
        class="border px-4 py-2 rounded"
      />
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
          <th class="border px-3 py-2">Status</th>
          <th class="border px-3 py-2">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="wd in withdraws" :key="wd.id" :class="{'bg-yellow-50': selectedWithdrawIds.has(wd.id)}">
          <td class="border px-3 py-2 text-center">
            <input
              type="checkbox"
              :disabled="wd.status !== 'pending'"
              :checked="selectedWithdrawIds.has(wd.id)"
              @change="toggleSelection(wd.id, $event.target.checked)"
            />
          </td>
          <td class="border px-3 py-2">{{ wd.id }}</td>
          <td class="border px-3 py-2">{{ formatDate(wd.createdon) }}</td>
          <td class="border px-3 py-2">{{ wd.customer?.username || wd.username }}</td>
          <td class="border px-3 py-2">{{ formatRupiah(wd.amount) }}</td>
          <td class="border px-3 py-2 capitalize">{{ wd.status }}</td>
          <td class="border px-3 py-2 space-x-2">
            <button
              v-if="wd.status === 'pending'"
              @click="updateStatus(wd.id, 'success')"
              class="bg-green-600 text-white px-3 py-1 rounded"
            >
              Setujui
            </button>
            <button
              v-if="wd.status === 'pending'"
              @click="updateStatus(wd.id, 'failed')"
              class="bg-red-600 text-white px-3 py-1 rounded"
            >
              Tolak
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="selectedWithdrawIds.size > 0" class="mt-4 space-x-2">
      <button
        @click="bulkUpdateStatus('success')"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Setujui Semua ({{ selectedWithdrawIds.size }})
      </button>
      <button
        @click="bulkUpdateStatus('failed')"
        class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Tolak Semua ({{ selectedWithdrawIds.size }})
      </button>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages >= 1" class="flex justify-center items-center mt-6 space-x-2 text-sm">
      <button
        :disabled="currentPage === 1"
        @click="currentPage--; fetchWithdraws()"
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
          page === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
        ]"
      >
        {{ page }}
      </button>

      <button
        :disabled="currentPage === totalPages"
        @click="currentPage++; fetchWithdraws()"
        class="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>

    <div class="mt-6 text-right space-y-1 text-sm">
      <div v-for="s in summary" :key="s.status">
        Total {{ s.status }}: <strong>{{ formatRupiah(s.total_amount) }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const withdraws = ref([])
const statusFilter = ref('')
const loading = ref(false)
const usernameFilter = ref('')
const summary = ref([])
const currentPage = ref(1)
const totalPages = ref(1)

// Menyimpan id withdraw yang dicentang
const selectedWithdrawIds = ref(new Set())

const fetchWithdraws = async () => {
  loading.value = true
  try {
    const response = await axios.get(API_ENDPOINTS.withdraw.list(
      statusFilter.value,
      usernameFilter.value,
      currentPage.value
    ))
    withdraws.value = response.data.data || []
    summary.value = response.data.summary || []
    totalPages.value = response.data.totalPages || 1

    // Kosongkan selected jika data baru dimuat
    selectedWithdrawIds.value.clear()
  } catch (error) {
    console.error('Gagal mengambil data withdraw:', error)
  } finally {
    loading.value = false
  }
}

const updateStatus = async (id, status) => {
  const actionText = status === 'success' ? 'menyetujui' : 'menolak'
  if (!confirm(`Apakah Anda yakin ingin ${actionText} withdraw ini?`)) return

  try {
    await axios.put(API_ENDPOINTS.withdraw.updateStatus(id), { status })
    await fetchWithdraws()
  } catch (err) {
    console.error('Gagal update status:', err)
    alert('Gagal memperbarui status withdraw')
  }
}

const toggleSelection = (id, checked) => {
  if (checked) {
    selectedWithdrawIds.value.add(id)
  } else {
    selectedWithdrawIds.value.delete(id)
  }
}

const toggleSelectAll = (checked) => {
  if (checked) {
    withdraws.value.forEach(wd => {
      if (wd.status === 'pending') selectedWithdrawIds.value.add(wd.id)
    })
  } else {
    selectedWithdrawIds.value.clear()
  }
}

const allSelected = computed(() => {
  const pendingIds = withdraws.value.filter(wd => wd.status === 'pending').map(wd => wd.id)
  return pendingIds.length > 0 && pendingIds.every(id => selectedWithdrawIds.value.has(id))
})

const bulkUpdateStatus = async (status) => {
  const actionText = status === 'success' ? 'menyetujui' : 'menolak'
  if (!confirm(`Apakah Anda yakin ingin ${actionText} semua withdraw yang dipilih?`)) return

  try {
    // Kirim permintaan bulk update, backend harus support array ids
    await axios.put(API_ENDPOINTS.withdraw.bulkUpdateStatus(), {
      ids: Array.from(selectedWithdrawIds.value),
      status
    })
    await fetchWithdraws()
  } catch (err) {
    console.error('Gagal update status bulk:', err)
    alert('Gagal memperbarui status withdraw secara massal')
  }
}

const formatDate = (val) => new Date(val).toLocaleString('id-ID')
const formatRupiah = (val) => {
  if (val === null || val === undefined || isNaN(val)) return 'Rp 0'
  return 'Rp ' + parseFloat(val).toLocaleString('id-ID')
}

const changePage = (page) => {
  if (page !== currentPage.value) {
    currentPage.value = page
    fetchWithdraws()
  }
}

onMounted(fetchWithdraws)
</script>
