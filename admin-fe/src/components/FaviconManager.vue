<template>
  <div class="bg-white p-6 rounded-xl shadow max-w-full mx-auto">
    <h1 class="text-xl font-bold text-gray-800 mb-4">Manajemen Favicon</h1>

    <div class="mb-4">
      <label class="block font-medium text-sm text-gray-700 mb-1">Preview Favicon</label>
      <img
        v-if="form.favicon"
        :src="form.favicon"
        alt="Favicon"
        class="w-12 h-12 rounded border"
      />
      <p v-else class="text-gray-500 text-sm">Belum ada favicon</p>
    </div>

    <div class="flex items-center gap-4 mb-4">
      <input type="file" @change="handleFileChange" accept=".ico,.png,.jpg,.jpeg" />
      <button
        @click="uploadFavicon"
        :disabled="!selectedFile"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Upload
      </button>
    </div>

    <div class="flex justify-end">
      <button
        @click="saveFavicon"
        class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
      >
        Simpan
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

export default {
  name: 'FaviconManager',

  data() {
    return {
      form: {
        favicon: '',
      },
      selectedFile: null,
    }
  },

  methods: {
    async fetchFavicon() {
      try {
        const res = await axios.get(API_ENDPOINTS.favicon)
        this.form.favicon = res.data?.value || ''
      } catch (err) {
        console.warn('Gagal mengambil favicon:', err)
        this.form.favicon = ''
      }
    },

    handleFileChange(event) {
      this.selectedFile = event.target.files[0] || null
    },

    async uploadFavicon() {
  if (!this.selectedFile) return

  const formData = new FormData()
  formData.append('file', this.selectedFile)

  try {
    const res = await axios.post(API_ENDPOINTS.icons, formData)

    // Paksa favicon URL jadi HTTPS
    const url = res.data.value || res.data.url || ''
    // this.form.favicon = url.replace(/^http:\/\//, 'https://')
    this.form.favicon = url

    this.selectedFile = null
  } catch (err) {
    console.error('Gagal upload favicon:', err)
    alert('Gagal upload file favicon.')
  }
},


    async saveFavicon() {
      try {
        const token = localStorage.getItem('token')
        await axios.post(
          API_ENDPOINTS.saveFavicon,
          { value: this.form.favicon },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        alert('Favicon berhasil disimpan.')
      } catch (err) {
        console.error('Gagal menyimpan favicon:', err)
        alert('Terjadi kesalahan saat menyimpan favicon.')
      }
    },
  },

  mounted() {
    this.fetchFavicon()
  },
}
</script>