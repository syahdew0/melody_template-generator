<template>
  <div class="bg-white p-4 rounded-lg shadow mb-8 max-w-full py-12 mx-auto">
    <h3 class="text-md font-semibold mb-4">Favicon</h3>

    <!-- Upload File -->
    <div class="flex items-center gap-2 mb-2">
      <input
        ref="fileInput"
        type="file"
        accept=".ico,image/png,image/jpeg,image/jpg"
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

    <!-- Preview Favicon -->
    <div
      v-if="form.favicon"
      class="bg-green-100 border border-green-300 rounded p-3 flex items-center gap-4 relative mb-4"
    >
      <img :src="form.favicon" alt="favicon preview" class="h-12 w-12 object-contain" />
      <span class="text-green-800">Favicon sudah dipilih.</span>
      <button
        @click="removeFavicon"
        class="absolute top-1 right-1 bg-red-500 text-white text-xs rounded px-2"
        type="button"
        aria-label="Hapus favicon"
      >
        x
      </button>
    </div>

    <!-- Tombol Simpan -->
    <div v-if="form.favicon && isAdmin">
      <button
        @click="saveFavicon"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        type="button"
      >
        Simpan
      </button>
    </div>

    <!-- Media Picker -->
    <MediaPicker
      :show="showPicker"
      @close="showPicker = false"
      @select="selectFromPicker"
    />

    <!-- List Favicon Sebelumnya -->
    <div v-if="faviconList.length" class="mt-6">
      <h4 class="text-sm font-semibold mb-2">Favicon Sebelumnya</h4>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="(icon, idx) in faviconList"
          :key="idx"
          class="cursor-pointer border rounded p-2 hover:border-blue-500 transition"
          @click="selectFromList(icon)"
        >
          <img :src="icon" alt="favicon" class="w-12 h-12 object-contain" />
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
        favicon: '',
      },
      faviconList: [],
    }
  },
  methods: {
    async fetchFavicon() {
      try {
        const res = await axios.get(API_ENDPOINTS.settingFavicon)
        if (res?.data?.value) {
          this.form.favicon = res.data.value
          this.faviconList = [res.data.value]
        }
      } catch (error) {
        console.error('Gagal mengambil favicon:', error)
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // Validasi ekstensi file
      const validExtensions = ['ico', 'png', 'jpg', 'jpeg']
      const ext = file.name.split('.').pop().toLowerCase()
      if (!validExtensions.includes(ext)) {
        alert('Silakan pilih file dengan format .ico, .png, .jpg, atau .jpeg')
        event.target.value = null
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      axios
        .post(API_ENDPOINTS.mediaUpload, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(res => {
          this.form.favicon = res.data?.url || ''
        })
        .catch(err => {
          console.error('Upload gagal:', err)
          alert('Upload favicon gagal.')
        })
    },
    selectFromPicker(url) {
      if (!this.isAdmin || !url) return
      this.form.favicon = url
      this.showPicker = false
    },
    selectFromList(url) {
      this.form.favicon = url
    },
    removeFavicon() {
      this.form.favicon = ''
    },
    async saveFavicon() {
      if (!this.isAdmin || !this.form.favicon) return

      const token = localStorage.getItem('token')
      try {
        await axios.post(
          API_ENDPOINTS.settingFavicon,
          { key: 'favicon', value: this.form.favicon },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        alert('Favicon berhasil disimpan!')
        this.addToFaviconList(this.form.favicon)
      } catch (error) {
        console.error('Gagal menyimpan favicon:', error)
        alert('Gagal menyimpan favicon.')
      }
    },
    addToFaviconList(newIcon) {
      if (!this.faviconList.includes(newIcon)) {
        this.faviconList.unshift(newIcon)
        this.faviconList = this.faviconList.slice(0, 5)
      }
    },
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.isAdmin = user?.role === 'admin'
    this.fetchFavicon()
  },
}
</script>

<style scoped>
input[type='file'] {
  border: 1px solid #ccc;
  padding: 6px;
  border-radius: 4px;
}
</style>
