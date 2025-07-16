<template>
  <div class="p-6 bg-white shadow rounded-2xl max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold text-slate-800 mb-6">Manajemen Media</h1>

    <!-- Upload -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
      <input type="file" @change="handleFileChange" ref="fileInput" class="border p-2 rounded w-full max-w-xs" />
      <input v-model="description" type="text" placeholder="Masukkan keterangan" class="border p-2 rounded w-full max-w-xs" />
      <button @click="uploadFile" :disabled="!selectedFile" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50">
        Upload
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const selectedFile = ref(null)
const description = ref('')
const fileInput = ref(null)

const handleFileChange = (e) => {
  selectedFile.value = e.target.files[0]
}

const uploadFile = async () => {
  if (!selectedFile.value) return

  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('description', description.value)

  try {
    await axios.post(API_ENDPOINTS.mediaUpload, formData)
    selectedFile.value = null
    description.value = ''
    fileInput.value.value = null
    alert('Media berhasil diunggah!')
  } catch (err) {
    console.error('Upload gagal:', err)
  }
}
</script>
