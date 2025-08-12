<template>
  <div class="p-6 space-y-8">

    <!-- Judul -->
    <h1 class="text-2xl font-bold">Adjust Manual (Saldo / Point / Stamp)</h1>

    <!-- Form Adjust -->
    <form @submit.prevent="submitAdjust" class="space-y-4 max-w-full">
      <div>
        <label class="block mb-1 font-semibold">Username</label>
        <input v-model="form.username" class="border w-full px-4 py-2 rounded" required />
      </div>

      <div>
        <label class="block mb-1 font-semibold">category</label>
        <select v-model="form.category" class="border w-full px-4 py-2 rounded" required>
        <option value="saldo">Saldo</option>
        <option value="point">Point</option>
        <option value="stamp">Stamp</option>
      </select>
      </div>

      <div>
        <label class="block mb-1 font-semibold">Jumlah (positif untuk tambah, negatif untuk kurangi)</label>
        <input
          type="number"
          v-model.number="form.amount"
          class="border w-full px-4 py-2 rounded"
          required
          :min="-999999"
          :max="999999"
        />
      </div>

      <div>
        <label class="block mb-1 font-semibold">Keterangan</label>
        <textarea v-model="form.remarks" class="border w-full px-4 py-2 rounded"></textarea>
      </div>

      <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        Submit Adjust
      </button>
    </form>

    <!-- Notifikasi -->
    <div v-if="message" class="text-green-600 font-semibold">{{ message }}</div>
    <div v-if="error" class="text-red-600 font-semibold">{{ error }}</div>

    <!-- Filter Username dan Date -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 max-w-full">
      <input
        type="date"
        v-model="filters.fromDate"
        class="border px-3 py-2 rounded"
        placeholder="From Date"
      />
      <input
        type="date"
        v-model="filters.toDate"
        class="border px-3 py-2 rounded"
        placeholder="To Date"
      />
      <input
        type="text"
        v-model="filters.username"
        class="border px-3 py-2 rounded"
        placeholder="Username"
      />
      <button
        @click="handleFilter"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Cari
      </button>
    </div>

    <!-- Pesan sebelum filter diterapkan -->
    <div v-if="!isSearched" class="text-center py-6 text-gray-500 max-w-full">
      Silakan pilih filter dan klik tombol Cari untuk melihat data.
    </div>

    <!-- Ringkasan Adjust -->
    <div v-if="isSearched" class="bg-gray-100 p-4 rounded shadow mt-6 max-w-full">
      <h2 class="text-lg font-bold mb-2">
        Ringkasan Adjust
        <span v-if="filters.username"> - {{ filters.username }}</span>
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          Masuk: <strong>{{ formatNumber(summary.in) }}</strong>
        </div>
        <div>
          Keluar: <strong>{{ formatNumber(summary.out) }}</strong>
        </div>
        <div>
          Net:
          <strong :class="summary.net >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ formatNumber(summary.net) }}
          </strong>
        </div>
      </div>
    </div>

    <!-- Tabel Adjust -->
    <div v-if="isSearched" class="overflow-x-auto max-w-full">
      <table class="table-auto w-full border mt-6">
        <thead class="bg-gray-100 text-left">
          <tr>
            <th class="px-4 py-2">No</th>
            <th class="px-4 py-2">Username</th>
            <th class="px-4 py-2">Tipe</th>
            <th class="px-4 py-2 text-right">Jumlah</th>
            <th class="px-4 py-2">Keterangan</th>
            <th class="px-4 py-2">Waktu</th>
            <th class="px-4 py-2">Admin</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in adjusts" :key="item.id" class="border-t">
            <td class="px-4 py-2">{{ (currentPage - 1) * 10 + i + 1 }}</td>
            <td class="px-4 py-2">{{ item.username }}</td>
            <td class="px-4 py-2 capitalize">{{ item.type }}</td>
            <td
              class="px-4 py-2 text-right"
              :class="item.amount >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ formatNumber(item.amount) }}
            </td>
            <td class="px-4 py-2">{{ item.remarks || '-' }}</td>
            <td class="px-4 py-2">{{ formatDate(item.createdon) }}</td>
            <td class="px-4 py-2">{{ item.createdby }}</td>
          </tr>
          <tr v-if="adjusts.length === 0">
            <td colspan="7" class="text-center py-4 text-gray-500">Tidak ada data</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="flex justify-center items-center gap-2 mt-4" v-if="totalPages >= 1">
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
            page === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
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
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const form = ref({
  username: '',
  category: 'saldo',
  type: 'in',  // default masuk
  amount: 0,
  remarks: '',
})


const message = ref('')
const error = ref('')
const adjusts = ref([])
const summary = ref({ in: 0, out: 0, net: 0 })

const filters = ref({
  fromDate: '',
  toDate: '',
  username: '',
})

const currentPage = ref(1)
const totalPages = ref(1)
const isSearched = ref(false)

const formatDate = (date) => new Date(date).toLocaleString('id-ID')
const formatNumber = (val) => Number(val).toLocaleString('id-ID')

const fetchAdjustSummary = async () => {
  try {
    const { fromDate, toDate, username } = filters.value
    const res = await axios.get(API_ENDPOINTS.adjust.summaryAdjust, {
      params: { fromDate, toDate, username },
    })
    summary.value = res.data.total
  } catch (err) {
    console.error('Gagal fetch summary:', err)
  }
}

const fetchAdjustList = async () => {
  try {
    const { fromDate, toDate, username } = filters.value
    const res = await axios.get(API_ENDPOINTS.adjust.list, {
      params: {
        fromDate,
        toDate,
        username,
        page: currentPage.value,
        limit: 10,
      },
    })
    adjusts.value = res.data.data
    totalPages.value = res.data.totalPages
    currentPage.value = res.data.currentPage
  } catch (err) {
    console.error('Gagal fetch adjust list:', err)
  }
}

const handleFilter = async () => {
  currentPage.value = 1
  isSearched.value = true
  await fetchAdjustSummary()
  await fetchAdjustList()
}

const submitAdjust = async () => {
  error.value = ''
  message.value = ''

  if (!form.value.username.trim()) {
    error.value = 'Username harus diisi'
    return
  }

  if (form.value.amount === 0) {
    error.value = 'Jumlah tidak boleh nol'
    return
  }

  try {
    const amount = form.value.amount;
    const type = amount < 0 ? 'out' : 'in';
    const absAmount = Math.abs(amount);

    const res = await axios.post(API_ENDPOINTS.adjust.create, {
      username: form.value.username.trim(),
      amount: absAmount,
      category: form.value.category,
      type: type,
      remarks: form.value.remarks,
    })

    message.value = res.data.message || 'Adjust berhasil!'
    form.value = { username: '', category: 'saldo', type: 'in', amount: 0, remarks: '' }

    if (isSearched.value) {
      await handleFilter()
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Terjadi kesalahan saat submit adjust.'
  }
}

const changePage = async (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    await fetchAdjustList()
  }
}

onMounted(() => {
  const today = new Date().toISOString().slice(0, 10)
  filters.value.fromDate = today
  filters.value.toDate = today
})
</script>
