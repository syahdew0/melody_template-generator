<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold mb-4">Daftar Username Transaksi</h1>

    <!-- Filter Form -->
    <!-- <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4"> -->
      <!-- <div>
        <label class="block text-sm font-medium">From Date</label>
        <input type="date" v-model="filters.fromDate" class="border px-2 py-1 rounded w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium">To Date</label>
        <input type="date" v-model="filters.toDate" class="border px-2 py-1 rounded w-full" />
      </div> -->
    <!-- </div> -->

    <!-- <button
      @click="fetchUsernames"
      class="bg-blue-600 hover:bg-blue-700 text-white w-full px-4 py-2 rounded"
    >
      Cari
    </button> -->

    <!-- Data Table -->
    <table class="w-full mt-6 text-sm border">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-2 py-1">No</th>
          <th class="border px-2 py-1">Username</th>
          <th class="border px-2 py-1">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(username, i) in usernames" :key="i">
          <td class="border px-2 py-1">{{ i + 1 }}</td>
          <td class="border px-2 py-1">{{ username }}</td>
          <td class="border px-2 py-1">
            <router-link
              class="text-blue-600 underline"
              :to="{ name: 'TransaksiHistory', query: { username } }"
            >
              Lihat Riwayat
            </router-link>
          </td>
        </tr>
        <tr v-if="usernames.length === 0">
          <td colspan="3" class="text-center py-4">Tidak ada data</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const usernames = ref([])
const filters = ref({
  fromDate: '',
  toDate: ''
})

const fetchUsernames = async () => {
  try {
    const token = localStorage.getItem('token')

    const res = await axios.get(`${API_ENDPOINTS.adminWalletHistory}/usernames`, {
      params: filters.value,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    usernames.value = res.data || []
  } catch (err) {
    console.error('Gagal mengambil username:', err)
  }
}

// Panggil saat komponen di-mount
onMounted(() => {
  fetchUsernames()
})
</script>
