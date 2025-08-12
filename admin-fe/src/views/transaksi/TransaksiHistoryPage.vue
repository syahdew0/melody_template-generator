<template>
  <div class="p-6 space-y-6 max-w-xl">
    <h1 class="text-2xl font-bold mb-4">Daftar Username Transaksi</h1>

    <!-- Filter Username dan Tanggal -->
    <div class="flex flex-wrap gap-4 mb-6 items-end">
      <div class="flex-1 min-w-[150px]">
        <label for="usernameSearch" class="block mb-1 font-medium">Cari Username</label>
        <input
          type="text"
          id="usernameSearch"
          v-model="filters.username"
          @keyup.enter="fetchUsernames"
          placeholder="Masukkan username"
          class="border p-2 rounded w-full"
        />
      </div>

      <div>
        <label for="fromDate" class="block mb-1 font-medium">Dari Tanggal</label>
        <input
          type="date"
          id="fromDate"
          v-model="filters.fromDate"
          class="border p-2 rounded"
        />
      </div>

      <div>
        <label for="toDate" class="block mb-1 font-medium">Sampai Tanggal</label>
        <input
          type="date"
          id="toDate"
          v-model="filters.toDate"
          class="border p-2 rounded"
        />
      </div>

      <button @click="fetchUsernames" class="bg-blue-600 text-white px-4 py-2 rounded">
        Filter
      </button>
    </div>

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

// Fungsi untuk dapatkan tanggal hari ini dalam format YYYY-MM-DD
function getTodayDate() {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const filters = ref({
  username: '',
  fromDate: getTodayDate(),
  toDate: getTodayDate()
})

const fetchUsernames = async () => {
  try {
    const token = localStorage.getItem('token')

    const params = {}
    if (filters.value.username) params.username = filters.value.username
    if (filters.value.fromDate) params.fromDate = filters.value.fromDate
    if (filters.value.toDate) params.toDate = filters.value.toDate

    const res = await axios.get(`${API_ENDPOINTS.adminWalletHistory}/usernames`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    usernames.value = res.data || []
  } catch (err) {
    console.error('Gagal mengambil username:', err)
  }
}

onMounted(() => {
  fetchUsernames()
})
</script>
