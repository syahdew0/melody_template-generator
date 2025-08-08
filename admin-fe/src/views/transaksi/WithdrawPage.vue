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
          <th class="border px-3 py-2">ID</th>
          <th class="border px-3 py-2">Tanggal</th>
          <th class="border px-3 py-2">Username</th>
          <th class="border px-3 py-2">Nominal</th>
          <th class="border px-3 py-2">Status</th>
          <th class="border px-3 py-2">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="wd in withdraws" :key="wd.id">
            <td class="border px-3 py-2">{{ wd.id }}</td>
            <td class="border px-3 py-2">{{ formatDate(wd.createdon) }}</td>
            <td class="border px-3 py-2">{{ wd.customer?.username || wd.username }}</td>
            <!-- <td class="border px-3 py-2">Rp{{ formatRupiah(wd.amount) }}</td> -->
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
import { ref, onMounted, } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const withdraws = ref([])
const statusFilter = ref('')
const loading = ref(false)
const usernameFilter = ref('')
const summary = ref([])
const currentPage = ref(1)
const totalPages = ref(1)

const fetchWithdraws = async () => {
  loading.value = true
  try {
    const response = await axios.get(API_ENDPOINTS.withdraw.list(
      statusFilter.value,
      usernameFilter.value,
      currentPage.value
    ));
    console.log('Withdraw response:', response.data); 
    withdraws.value = response.data.data || []
    summary.value = response.data.summary || []
    totalPages.value = response.data.totalPages || 1
  } catch (error) {
    console.error('Gagal mengambil data withdraw:', error)
  } finally {
    loading.value = false
  }
}

const updateStatus = async (id, status) => {
  try {
    await axios.put(API_ENDPOINTS.withdraw.updateStatus(id), { status })
    fetchWithdraws()
  } catch (err) {
    console.error('Gagal update status:', err)
  }
};


// const totalAmount = computed(() => {
//   return withdraws.value.reduce((sum, wd) => {
//     return sum + (parseFloat(wd.amount) || 0)
//   }, 0)
// })

const formatDate = (val) => new Date(val).toLocaleString('id-ID')
const formatRupiah = (val) => {
  if (val === null || val === undefined || isNaN(val)) return 'Rp 0'
  return 'Rp ' + parseFloat(val).toLocaleString('id-ID')
}


onMounted(fetchWithdraws)
</script>
