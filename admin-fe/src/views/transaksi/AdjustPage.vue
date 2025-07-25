<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold mb-4">Adjust Saldo Manual</h1>

    <form @submit.prevent="submitAdjust" class="space-y-4 max-w-md">
      <div>
        <label class="block mb-1 font-semibold">Username</label>
        <input v-model="form.username" class="border w-full px-4 py-2 rounded" required />
      </div>

      <div>
        <label class="block mb-1 font-semibold">Tipe</label>
        <select v-model="form.type" class="border w-full px-4 py-2 rounded" required>
          <option value="increase">Tambah Saldo</option>
          <option value="decrease">Kurangi Saldo</option>
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

    <div v-if="message" class="mt-4 text-green-600 font-semibold">{{ message }}</div>
    <div v-if="error" class="mt-4 text-red-600 font-semibold">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const form = ref({
  username: '',
  type: 'increase',
  amount: 0,
  remarks: ''
})

const message = ref('')
const error = ref('')

const submitAdjust = async () => {
  error.value = ''
  message.value = ''

  if (form.value.amount <= 0) {
    error.value = 'Jumlah tidak boleh nol atau negatif'
    return
  }

  const mappedType = form.value.type === 'increase' ? 'in' : 'out'

  try {
    const res = await axios.post(API_ENDPOINTS.adjust.create, {
      ...form.value,
      type: mappedType
    })

    message.value = res.data.message || 'Adjust berhasil!'
    form.value = { username: '', type: 'increase', amount: 0, remarks: '' }
  } catch (err) {
    console.error('Gagal submit adjust:', err)
    error.value = err.response?.data?.message || 'Terjadi kesalahan saat submit adjust.'
  }
}

</script>
