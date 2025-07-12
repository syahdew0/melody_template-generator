<template>
  <div class="p-6 bg-white rounded-lg shadow-md max-w-full mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Edit Hero Section Kontak</h2>

    <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      Hanya admin yang dapat mengedit konten ini.
    </p>

    <form @submit.prevent="updateData" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Judul</label>
        <input
          v-model="form.title"
          type="text"
          class="w-full border border-gray-300 rounded px-4 py-2"
          :disabled="!isAdmin"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Subjudul</label>
        <textarea
          v-model="form.subtitle"
          class="w-full border border-gray-300 rounded px-4 py-2"
          :disabled="!isAdmin"
          rows="3"
          required
        ></textarea>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">CTA 1 - Teks</label>
          <input
            v-model="form.cta1Text"
            type="text"
            class="w-full border border-gray-300 rounded px-4 py-2"
            :disabled="!isAdmin"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">CTA 1 - Link</label>
          <input
            v-model="form.cta1Link"
            type="text"
            class="w-full border border-gray-300 rounded px-4 py-2"
            :disabled="!isAdmin"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">CTA 2 - Teks</label>
          <input
            v-model="form.cta2Text"
            type="text"
            class="w-full border border-gray-300 rounded px-4 py-2"
            :disabled="!isAdmin"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">CTA 2 - Path</label>
          <input
            v-model="form.cta2Path"
            type="text"
            class="w-full border border-gray-300 rounded px-4 py-2"
            :disabled="!isAdmin"
          />
        </div>
      </div>

      <div class="pt-4" v-if="isAdmin">
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition duration-200"
        >
          {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </form>

    <p v-if="message" class="mt-4 text-green-600">{{ message }}</p>
    <p v-if="error" class="mt-4 text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

// Data form hero section
const form = ref({
  title: '',
  subtitle: '',
  cta1Text: '',
  cta1Link: '',
  cta2Text: '',
  cta2Path: ''
})

// State
const loading = ref(false)
const message = ref('')
const error = ref('')
const isAdmin = ref(false)

// Ambil data dari API
const fetchData = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.heroContact)
    Object.assign(form.value, res.data)
  } catch (err) {
    error.value = 'Gagal memuat data.'
    console.error(err)
  }
}

// Simpan data ke API
const updateData = async () => {
  if (!isAdmin.value) return
  loading.value = true
  message.value = ''
  error.value = ''

  try {
    await axios.put(API_ENDPOINTS.heroContact, form.value)
    message.value = 'Data berhasil diperbarui.'
  } catch (err) {
    error.value = 'Gagal memperbarui data.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Cek role saat mount
onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user?.role === 'admin'
  fetchData()
})
</script>
