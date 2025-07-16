<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg overflow-y-auto max-h-[80vh]">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Pilih Media</h2>
        <button @click="$emit('close')" class="text-red-600 font-bold text-xl">×</button>
      </div>

      <!-- Upload Section -->
      <form @submit.prevent="uploadMedia" class="flex items-center gap-3 mb-6">
        <input type="file" @change="handleFileChange" />
        <button type="submit" class="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm" :disabled="uploading">
          {{ uploading ? 'Mengupload...' : 'Upload' }}
        </button>
      </form>

      <!-- Media Grid -->
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        <div v-for="media in mediaList" :key="media.id" @click="$emit('select', media.url)" class="cursor-pointer border rounded overflow-hidden hover:shadow">
          <img v-if="isImage(media.url)" :src="media.url" class="w-full h-32 object-cover" />
          <video v-else :src="media.url" class="w-full h-32 object-cover"></video>
          <div class="text-xs p-2 truncate">{{ media.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'
  // eslint-disable-next-line no-undef
  /* global defineProps */
defineProps({ show: Boolean })

const mediaList = ref([])
const selectedFile = ref(null)
const uploading = ref(false)

const loadMedia = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.mediaList)
    mediaList.value = res.data
  } catch (err) {
    console.error('Gagal memuat media:', err)
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file && !file.name.match(/\.(ico|jpg|jpeg|png|gif|webp)$/i)) {
    alert('Format file tidak didukung.')
    e.target.value = null
    return
  }
  selectedFile.value = file
}

const uploadMedia = async () => {
  if (!selectedFile.value) return

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  uploading.value = true
  try {
    await axios.post(API_ENDPOINTS.mediaUpload, formData)
    selectedFile.value = null
    await loadMedia()
  } catch (err) {
    console.error('Upload gagal:', err)
  } finally {
    uploading.value = false
  }
}

const isImage = (url) => /\.(ico|jpg|jpeg|png|gif|webp)$/i.test(url)

onMounted(loadMedia)
</script>
