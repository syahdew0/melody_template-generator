<template>
  <div class="p-6 space-y-8">

    <!-- Judul -->
    <h1 class="text-2xl font-bold">Adjust Saldo Manual</h1>

    <!-- Form Adjust -->
    <form @submit.prevent="submitAdjust" class="space-y-4 max-w-md">
      <div>
        <label class="block mb-1 font-semibold">Username</label>
        <input v-model="form.username" class="border w-full px-4 py-2 rounded" required />
      </div>

      <div>
        <label class="block mb-1 font-semibold">Tipe</label>
        <select v-model="form.type" class="border w-full px-4 py-2 rounded" required>
          <!-- <option value="in">Tambah Saldo</option>
          <option value="out">Kurangi Saldo</option> -->
          <option value="in">Tambah Saldo</option>
          <option value="out">Kurangi Saldo</option>
        </select>
      </div>

      <div>
        <label class="block mb-1 font-semibold">Jumlah</label>
        <input
          type="number"
          v-model.number="form.amount"
          class="border w-full px-4 py-2 rounded"
          required
          min="0"
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

    <!-- Filter Username -->
    <div class="mt-8">
      <label class="block mb-1 font-semibold">Total Adjust atas nama</label>
      <input
        v-model="filterUsername"
        @input="fetchAdjustSummary"
        class="border w-full px-4 py-2 rounded"
        placeholder="Masukkan username"
      />
    </div>

    <!-- Ringkasan Adjust -->
    <div class="bg-gray-100 p-4 rounded shadow mt-6">
      <h2 class="text-lg font-bold mb-2">
        Ringkasan Adjust
        <span v-if="filterUsername">{{ filterUsername }}</span>
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          Masuk: <strong>Rp {{ summary.in.toLocaleString() }}</strong>
        </div>
        <div>
          Keluar: <strong>Rp {{ summary.out.toLocaleString() }}</strong>
        </div>
        <div>
          Net:
          <strong :class="summary.net >= 0 ? 'text-green-600' : 'text-red-600'">
            Rp {{ summary.net.toLocaleString() }}
          </strong>
        </div>
      </div>
    </div>

    <!-- Tabel Adjust -->
    <div class="overflow-x-auto">
      <table class="table-auto w-full border mt-6">
        <thead class="bg-gray-100 text-left">
          <tr>
            <th class="px-4 py-2">No</th>
            <th class="px-4 py-2">Username</th>
            <th class="px-4 py-2">Tipe</th>
            <th class="px-4 py-2">Jumlah</th>
            <th class="px-4 py-2">Keterangan</th>
            <th class="px-4 py-2">Waktu</th>
            <th class="px-4 py-2">Admin</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in adjusts" :key="item.id" class="border-t">
            <td class="px-4 py-2">{{ i + 1 }}</td>
            <td class="px-4 py-2">{{ item.username }}</td>
            <td class="px-4 py-2">{{ item.type }}</td>
            <td class="px-4 py-2">Rp {{ item.amount.toLocaleString() }}</td>
            <td class="px-4 py-2">{{ item.remarks }}</td>
            <td class="px-4 py-2">{{ formatDate(item.createdon) }}</td>
            <td class="px-4 py-2">{{ item.createdby }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const form = ref({
  username: '',
  type: 'in',
  amount: 0,
  remarks: ''
})

const message = ref('')
const error = ref('')
const adjusts = ref([])
const summary = ref({ in: 0, out: 0, net: 0 })
const filterUsername = ref('')


const formatDate = (date) => new Date(date).toLocaleString()

// Fungsi ambil summary adjust
const fetchAdjustSummary = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.adjust.summaryAdjust, {
      params: {
        username: filterUsername.value || undefined
      }
    })
    summary.value = res.data.total
  } catch (err) {
    console.error('Gagal fetch summary:', err)
  }
}

// Fungsi ambil data adjust list
const fetchAdjustList = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.adjust.list)
    adjusts.value = res.data
  } catch (err) {
    console.error('Gagal fetch adjust list:', err)
  }
}

// Submit form
const submitAdjust = async () => {
  error.value = ''
  message.value = ''

  if (form.value.amount <= 0) {
    error.value = 'Jumlah tidak boleh nol atau negatif'
    return
  }

  try {
    const res = await axios.post(API_ENDPOINTS.adjust.create, {
      username: form.value.username.trim(),
      amount: form.value.amount,
      type: form.value.type,
      remarks: form.value.remarks
    })

    message.value = res.data.message || 'Adjust berhasil!'
    form.value = { username: '', type: 'in', amount: 0, remarks: '' }

    await fetchAdjustList()
    await fetchAdjustSummary()

  } catch (err) {
    console.error('Gagal submit adjust:', err)
    error.value = err.response?.data?.message || 'Terjadi kesalahan saat submit adjust.'
  }
}


// Jalankan saat komponen mount
onMounted(async () => {
  await fetchAdjustList()
  await fetchAdjustSummary()
})

</script>
