<template>
  <div class="bg-white p-4 rounded-lg shadow mb-8">
    <h3 class="text-md font-semibold mb-4">Logo Website</h3>

    <!-- Upload File -->
    <div class="flex items-center gap-2 mb-2">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="block"
        @change="handleFileUpload"
        :disabled="!isAdmin"
      />
      <span class="text-black font-semibold">atau</span>
      <button
        type="button"
        @click="showPicker = true"
        class="border px-4 py-1 rounded hover:bg-gray-100 text-black"
        :disabled="!isAdmin"
      >
        Pilih dari media
      </button>
    </div>

    <!-- Preview Gambar -->
    <div v-if="form.image" class="bg-green-100 border border-green-300 rounded p-3 flex items-center gap-4 relative mb-4">
      <img :src="form.image" class="h-12 object-contain" />
      <span class="text-green-800">Gambar sudah dipilih.</span>
      <button
        @click="removeImage"
        class="absolute top-1 right-1 bg-red-500 text-white text-xs rounded px-2"
      >
        x
      </button>
    </div>

    <!-- Tombol Simpan -->
    <div v-if="form.image && isAdmin">
      <button
        @click="saveLogo"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Simpan
      </button>
    </div>

    <!-- Media Picker -->
    <MediaPicker :show="showPicker" @close="showPicker = false" @select="selectImageFromPicker" />

    <!-- List Logo Sebelumnya -->
    <div v-if="logoList.length" class="mt-6">
      <h4 class="text-sm font-semibold mb-2">Logo Sebelumnya</h4>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="(logo, index) in logoList"
          :key="index"
          class="cursor-pointer border rounded p-2 hover:border-blue-500 transition"
          @click="selectFromList(logo)"
        >
          <img :src="logo" class="w-24 h-16 object-contain" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import MediaPicker from '@/views/MediaPicker.vue'
import { API_ENDPOINTS } from '@/config/api'

export default {
  components: { MediaPicker },
  data() {
    return {
      isAdmin: false,
      showPicker: false,
      form: {
        image: '',
      },
      logoList: [],
    }
  },
  methods: {
    async fetchLogo() {
      try {
        const res = await axios.get(API_ENDPOINTS.settingLogo)
        if (res?.data?.value) {
          this.form.image = res.data.value
          this.logoList = [res.data.value]
        }
      } catch (err) {
        console.error('Gagal mengambil logo:', err)
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      axios
        .post(API_ENDPOINTS.mediaUpload, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data',
            withCredentials: true,
          },
        })
        .then((res) => {
          this.form.image = res.data?.url || ''
        })
        .catch((err) => {
          console.error('Upload gagal:', err)
          alert('Upload gambar gagal.')
        })
    },
    selectImageFromPicker(mediaUrl) {
      if (!this.isAdmin || !mediaUrl) return
      this.form.image = mediaUrl
      this.showPicker = false
    },
    selectFromList(url) {
      this.form.image = url
    },
    removeImage() {
      this.form.image = ''
    },
    async saveLogo() {
      if (!this.isAdmin || !this.form.image) return
      const token = localStorage.getItem('token')
      try {
        await axios.post(
          API_ENDPOINTS.settingLogo,
          { key: 'logo', value: this.form.image },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        alert('Logo berhasil disimpan!')
        this.addToLogoList(this.form.image)
      } catch (err) {
        console.error('Gagal menyimpan logo:', err)
        alert('Gagal menyimpan logo.')
      }
    },
    addToLogoList(newLogo) {
      if (!this.logoList.includes(newLogo)) {
        this.logoList.unshift(newLogo)
        this.logoList = this.logoList.slice(0, 5)
      }
    },
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.isAdmin = user?.role === 'admin'
    this.fetchLogo()
  },
}
</script>

<style scoped>
input[type="file"] {
  border: 1px solid #ccc;
  padding: 6px;
  border-radius: 4px;
}
</style>
