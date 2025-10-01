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
        let url = res.data.value || res.data || '/uploads/default-favicon.ico'

        // Pakai HTTPS untuk domain live, HTTP untuk localhost
        if (url.includes('localhost')) {
          this.form.favicon = url
        } else {
          this.form.favicon = url.replace(/^http:\/\//, 'https://')
        }
      } catch (err) {
        console.warn('Gagal mengambil favicon:', err)
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
    const token = localStorage.getItem('token')
    const res = await axios.post(API_ENDPOINTS.icons, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    let url = res.data.value || res.data.url || '/uploads/default-favicon.ico'
    if (url.includes('localhost')) {
      this.form.favicon = url
    } else {
      this.form.favicon = url.replace(/^http:\/\//, 'https://')
    }

    this.selectedFile = null
    alert('Favicon berhasil di-upload.')
  } catch (err) {
    console.error('Gagal upload favicon:', err)
    alert('Gagal upload favicon. Pastikan Anda login sebagai admin.')
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
