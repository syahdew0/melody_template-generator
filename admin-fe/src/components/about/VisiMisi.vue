<template>
  <div class="max-w-4xl px-6 md:px-12 mx-auto mt-10 mb-12 space-y-10">
    <h2 class="text-2xl font-bold mb-4">Kelola Visi, Misi & Statistik</h2>

    <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      Hanya admin yang dapat <strong>mengedit</strong> konten.
    </p>

    <!-- Judul & Subjudul -->
    <div>
      <label class="block font-semibold mb-2">Judul</label>
      <input v-model="form.title" type="text" class="input" :disabled="!isAdmin" placeholder="Contoh: Vision and Mission" />
    </div>
    <div>
      <label class="block font-semibold mb-2">Subjudul</label>
      <input v-model="form.subtitle" type="text" class="input" :disabled="!isAdmin" placeholder="Contoh: Our Commitment" />
    </div>

    <!-- Visi -->
    <div>
      <label class="block font-semibold mb-2">Visi</label>
      <textarea v-model="form.visi" rows="4" class="input" :disabled="!isAdmin"></textarea>
    </div>

    <!-- Misi -->
    <div>
      <label class="block font-semibold mb-2">Misi</label>
      <div v-for="(misiItem, index) in form.misi" :key="index" class="flex items-start mb-3">
        <textarea v-model="form.misi[index]" rows="2" class="input mr-2" :disabled="!isAdmin" placeholder="Masukkan misi"></textarea>
        <button v-if="isAdmin" @click="removeMisi(index)" class="text-red-600 hover:text-red-800 font-bold">&times;</button>
      </div>
      <button v-if="isAdmin" @click="addMisi" class="mt-2 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600">
        + Tambah Misi
      </button>
    </div>

    <!-- Statistik -->
    <div>
      <label class="block font-semibold mb-2">Statistik</label>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="(stat, index) in form.stats" :key="index">
          <label class="block font-medium mb-1">Label</label>
          <input v-model="stat.label" type="text" class="input mb-2" :disabled="!isAdmin" placeholder="Contoh: Happy Clients" />
          <label class="block font-medium mb-1">Jumlah</label>
          <input v-model.number="stat.value" type="number" class="input" :disabled="!isAdmin" />
        </div>
      </div>
      <button v-if="isAdmin" @click="addStat" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        + Tambah Statistik
      </button>
    </div>

    <!-- Tombol Simpan -->
    <div class="text-right" v-if="isAdmin">
      <button @click="submitForm" class="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
        Simpan
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const isAdmin = ref(false)

const form = ref({
  title: '',
  subtitle: '',
  visi: '',
  misi: [''],
  stats: [
    { label: 'Years of Experience', value: 0 },
    { label: 'Completed Projects', value: 0 },
    { label: 'Happy Clients', value: 0 }
  ]
})

const addMisi = () => form.value.misi.push('')
const removeMisi = (i) => form.value.misi.splice(i, 1)

const addStat = () => form.value.stats.push({ label: '', value: 0 })

const fetchData = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.visiMisi)
    const data = res.data
    form.value = {
      title: data.title || '',
      subtitle: data.subtitle || '',
      visi: data.visi || '',
      misi: Array.isArray(data.misi) ? data.misi : [''],
      stats: Array.isArray(data.stats) ? data.stats : []
    }
  } catch (e) {
    console.error('Gagal fetch:', e)
  }
}

const submitForm = async () => {
  try {
    await axios.post(API_ENDPOINTS.visiMisi, form.value)
    alert('Data berhasil disimpan!')
  } catch (e) {
    console.error(e)
    alert('Gagal menyimpan data')
  }
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user?.role === 'admin'
  fetchData()
})
</script>

<style scoped>
.input {
  @apply w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500;
}
textarea {
  resize: vertical;
}
</style>
