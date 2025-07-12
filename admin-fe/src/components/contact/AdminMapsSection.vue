<template>
  <div class="p-6 max-w-full mx-auto bg-white rounded-xl shadow-md">
    <h2 class="text-2xl font-semibold mb-6">Kelola Maps Section</h2>

    <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      hanya admin yang dapat <strong>mengedit</strong> dan dapat mengubah konten.
    </p>

    <form @submit.prevent="updateMapsSection" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium mb-1">Judul</label>
        <input v-model="form.title" type="text" class="w-full border rounded px-4 py-2" :disabled="!isAdmin" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-1">Deskripsi</label>
        <textarea v-model="form.description" class="w-full border rounded px-4 py-2" rows="3" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-1">URL Google Maps (untuk tombol)</label>
        <input v-model="form.mapUrl" type="text" class="w-full border rounded px-4 py-2" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-1">Embed URL (untuk iframe)</label>
        <input v-model="form.mapEmbedUrl" type="text" class="w-full border rounded px-4 py-2" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-1">Teks Tombol "Lihat di Maps"</label>
        <input v-model="form.buttonMapText" type="text" class="w-full border rounded px-4 py-2" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-1">Teks Tombol "Bagikan Lokasi"</label>
        <input v-model="form.buttonShareText" type="text" class="w-full border rounded px-4 py-2" />
      </div>

      <div class="pt-4">
        <button v-if="isAdmin" type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Simpan Perubahan
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const isAdmin = ref(false)
const user = JSON.parse(localStorage.getItem('user') || '{}')
isAdmin.value = user?.role === 'admin'

const form = ref({
  title: '',
  description: '',
  mapUrl: '',
  mapEmbedUrl: '',
  buttonMapText: '',
  buttonShareText: '',
})

const fetchMapsData = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.mapsSection)
    Object.assign(form.value, res.data)
  } catch (err) {
    console.error('Gagal mengambil data:', err)
  }
}

const updateMapsSection = async () => {
  try {
    await axios.put(API_ENDPOINTS.mapsSection, form.value)
    alert('Maps section berhasil diperbarui!')
  } catch (err) {
    console.error('Gagal menyimpan:', err)
    alert('Gagal menyimpan perubahan.')
  }
}

onMounted(fetchMapsData)
</script>
