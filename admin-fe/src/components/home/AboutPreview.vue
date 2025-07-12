<template>
  <div class="p-6 max-w-full mx-auto">
    <h2 class="text-2xl font-bold mb-4">About Preview</h2>

    <!-- Notif untuk non-admin -->
    <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      Hanya admin yang dapat <strong>mengedit</strong> dan mengubah konten.
    </p>

    <form @submit.prevent="saveData" class="space-y-4">
      <div>
        <label class="font-medium block mb-1">Judul</label>
        <input
          v-model="form.title"
          :readonly="!isAdmin"
          class="w-full border rounded px-3 py-2"
          type="text"
        />
      </div>

      <div>
        <label class="font-medium block mb-1">Deskripsi</label>
        <textarea
          v-model="form.description"
          :readonly="!isAdmin"
          class="w-full border rounded px-3 py-2"
          rows="5"
        ></textarea>
      </div>

      <!-- Kolom Gambar + Tombol Media Picker -->
      <div>
        <label class="font-medium block mb-1">Gambar</label>
        <div class="flex space-x-2">
          <input
            v-model="form.image"
            class="flex-1 border rounded px-3 py-2"
            type="text"
            placeholder="URL gambar"
            :readonly="!isAdmin"
          />
          <button
            type="button"
            @click="showMediaPicker = true"
            v-if="isAdmin"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Pilih
          </button>
        </div>

        <div v-if="form.image" class="mt-2">
          <img :src="form.image" alt="Preview" class="h-32 rounded border" />
        </div>
      </div>

      <div v-if="isAdmin">
        <button
          type="submit"
          class="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded shadow"
        >
          Simpan
        </button>
      </div>
    </form>

    <!-- MediaPicker Modal -->
    <MediaPicker
      v-if="showMediaPicker"
      :show="showMediaPicker"
      @select="onImageSelected"
      @close="showMediaPicker = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'
import MediaPicker from '@/components/MediaPicker.vue'

// Form Data
const form = ref({
  title: '',
  description: '',
  image: '',
  link: ''
})

// Role Check
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = ref(user?.role === 'admin')

// Media Picker Modal
const showMediaPicker = ref(false)

const onImageSelected = (url) => {
  form.value.image = url
  showMediaPicker.value = false
}

const loadData = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.aboutPreview)
    form.value = res.data || {
      title: '',
      description: '',
      image: '',
      link: ''
    }
  } catch (error) {
    console.error('Gagal memuat data:', error)
  }
}

const saveData = async () => {
  if (!isAdmin.value) {
    alert('Hanya admin yang dapat menyimpan data.')
    return
  }

  try {
    await axios.put(API_ENDPOINTS.aboutPreview, form.value)
    alert('Data berhasil disimpan!')
  } catch (error) {
    alert('Gagal menyimpan data.')
    console.error('SAVE ERROR:', error)
  }
}

onMounted(loadData)
</script>
