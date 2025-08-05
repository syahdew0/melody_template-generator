<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold mb-4">Manajemen Withdraw</h1>

    <div class="flex justify-between items-center mb-4">
      <select v-model="statusFilter" @change="fetchWithdraws" class="border px-4 py-2 rounded">
        <option value="">Semua</option>
        <option value="pending">Pending</option>
        <option value="success">Disetujui</option>
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
    <!-- <div class="text-right font-semibold mt-4">
  Total Nominal: Rp{{ formatRupiah(totalAmount) }}
</div> -->

  </div>
</template>

<script setup>
import { ref, onMounted, } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const withdraws = ref([])
const statusFilter = ref('')
const loading = ref(false)
// const summary = ref([])

const fetchWithdraws = async () => {
  loading.value = true;
  try {
    const response = await axios.get(API_ENDPOINTS.withdraw.list(statusFilter.value));
    withdraws.value = response.data.data || response.data
    // summary.value = response.data.summary || []
  } catch (error) {
    console.error('Gagal mengambil data withdraw:', error);
  } finally {
    loading.value = false;
  }
};

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
