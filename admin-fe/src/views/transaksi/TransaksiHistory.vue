<template>
  <div class="p-6 space-y-6">
    <!-- Tombol Kembali -->
    <button
      @click="$router.back()"
      class="flex items-center text-blue-600 hover:underline mb-4"
    >
      ← Kembali
    </button>
    <h1 class="text-2xl font-bold mb-4">
      Riwayat Transaksi <span v-if="filters.username">- {{ filters.username }}</span>
    </h1>

    <!-- Filter Form -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium">From Date</label>
        <input
          type="date"
          v-model="filters.fromDate"
          class="border px-2 py-1 rounded w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium">To Date</label>
        <input
          type="date"
          v-model="filters.toDate"
          class="border px-2 py-1 rounded w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium">Transaction Type</label>
        <select v-model="filters.transaction_type" class="border px-2 py-1 rounded w-full">
          <option value="">Semua</option>
          <option value="topup">Topup</option>
          <option value="withdraw">Withdraw</option>
          <option value="adjust_plus">Adjust Masuk</option>
          <option value="adjust_minus">Adjust Keluar</option>
        </select>
      </div>
    </div>

    <button
      @click="handleSearch"
      class="bg-blue-600 hover:bg-blue-700 text-white w-full px-4 py-2 rounded"
    >
      Cari
    </button>

    <!-- Pesan sebelum cari -->
    <div v-if="!isSearched" class="text-center py-6 text-gray-500">
      Silakan pilih filter dan klik tombol Cari untuk melihat data.
    </div>

    <!-- Data Table -->
    <table v-if="isSearched" class="w-full mt-6 text-sm border">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-2 py-1">Tanggal</th>
          <th class="border px-2 py-1">Username</th>
          <!-- <th class="border px-2 py-1">Wallet ID</th> -->
          <th class="border px-2 py-1">Tipe</th>
          <th class="border px-2 py-1">Saldo Sebelum</th>
          <th class="border px-2 py-1">Jumlah</th>
          <th class="border px-2 py-1">Saldo Sesudah</th>
          <th class="border px-2 py-1">Keterangan</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="h in histories" :key="h.id">
          <td class="border px-2 py-1">{{ formatDate(h.created_at) }}</td>
          <td class="border px-2 py-1">{{ h.username }}</td>
          <!-- <td class="border px-2 py-1">{{ h.walletId }}</td> -->
          <!-- <td class="border px-2 py-1">{{ formatType(h.transaction_type) }}</td> -->
          <td class="border px-3 py-2">{{ formatType(h.transaction_type, h.status) }}</td>
          <td class="border px-2 py-1">{{ formatAmount(h.balance_before, h.wallet_type) }}</td>
          <td
            class="border px-3 py-2 text-center font-semibold"
            :class="{
              'text-green-600': h.amount > 0 && h.status !== 'failed',
              'text-red-600': h.amount < 0 || h.status === 'failed'
            }">
            {{ h.amount < 0 ? '-' : '+' }} {{ formatAmount(Math.abs(h.amount), h.wallet_type) }}
          </td>
          <td class="border px-2 py-1">{{ formatAmount(h.balance_after, h.wallet_type) }}</td>
          <td class="border px-2 py-1">{{ h.remarks || '-' }}</td>
        </tr>
        <tr v-if="histories.length === 0">
          <td colspan="6" class="text-center py-4">Tidak ada data</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination Controls -->
    <div v-if="isSearched" class="mt-4 flex justify-between items-center">
      <button
        class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        :disabled="pagination.page <= 1"
        @click="changePage(pagination.page - 1)"
      >
        Sebelumnya
      </button>
      <span>Halaman {{ pagination.page }} dari {{ pagination.totalPages }}</span>
      <button
        class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        :disabled="pagination.page >= pagination.totalPages"
        @click="changePage(pagination.page + 1)"
      >
        Berikutnya
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { API_ENDPOINTS } from '@/config/api'

const histories = ref([])
const route = useRoute()
const filters = ref({
  fromDate: '',
  toDate: '',
  username: '',
  wallet_id: '',
  transaction_type: '',
})
const pagination = ref({
  page: 1,
  limit: 15,
  totalPages: 1
})
const isSearched = ref(false)

const fetchHistories = async () => {
  try {
    const token = localStorage.getItem('token')

    const params = {
      ...filters.value,
      page: pagination.value.page,
      limit: pagination.value.limit
    }

    const res = await axios.get(API_ENDPOINTS.adminWalletHistory, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    histories.value = res.data.rows || []
    pagination.value.totalPages = Math.ceil((res.data.count || 0) / pagination.value.limit)

  } catch (error) {
    console.error('Gagal mengambil data:', error)
  }
}

const changePage = (newPage) => {
  pagination.value.page = newPage
  fetchHistories()
}

const handleSearch = () => {
  pagination.value.page = 1
  isSearched.value = true
  fetchHistories()
}

onMounted(() => {
  const today = new Date().toISOString().slice(0, 10)
  filters.value.fromDate = today
  filters.value.toDate = today

  const usernameQuery = route.query.username
  if (usernameQuery) {
    filters.value.username = usernameQuery
  }

  // Jangan fetch otomatis supaya data tidak muncul saat load halaman
})

const formatDate = (val) => {
  if (!val) return '-'
  return new Date(val).toLocaleString('id-ID')
}

const formatAmount = (val, walletType) => {
  if (walletType === 'point' || walletType === 'stamp') {
    return val ?? 0; // tampilkan angka saja
  }
  return 'Rp' + (val != null ? Number(val).toLocaleString('id-ID') : 0);
}


// const formatType = (val) => {
//   switch (val) {
//     case 'topup': return 'Topup'
//     case 'withdraw': return 'Withdraw'
//     case 'adjust_plus': return 'Adjust Masuk'
//     case 'adjust_minus': return 'Adjust Keluar'
//     default: return val
//   }
// }
const formatType = (val, status) => {
  if (val === 'withdraw') {
    if (status === 'success') return 'Withdraw disetujui'
    if (status === 'failed') return 'Withdraw ditolak'
    return 'Withdraw'
  }

  if (val === 'topup') {
    if (status === 'success') return 'Topup berhasil'
    if (status === 'failed') return 'Topup ditolak'
    return 'Topup'
  }

  switch (val) {
    case 'adjust_plus':
      return 'Adjust Masuk'
    case 'adjust_minus':
      return 'Adjust Keluar'
    default:
      return val
  }
}

</script>