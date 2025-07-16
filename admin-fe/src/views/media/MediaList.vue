<template>
  <div class="p-6 bg-white shadow rounded-2xl max-w-6xl mx-auto min-h-screen">
    <h1 class="text-3xl font-bold text-slate-800 mb-6">Daftar Media</h1>

    <!-- Pencarian -->
    <input v-model="searchQuery" type="text" placeholder="Cari media..." class="border p-2 rounded mb-6 w-full max-w-md" />

    <!-- Grid -->
    <div v-if="filteredMedia.length === 0" class="text-slate-500">Belum ada media.</div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div v-for="media in filteredMedia" :key="media.id" class="group relative border rounded-lg overflow-hidden shadow hover:shadow-lg">
        <component :is="isVideo(media.url) ? 'video' : 'img'" :src="media.url" controls class="w-full h-40 object-cover transition duration-300" />
        <div class="absolute bottom-0 w-full bg-white/80 p-2 text-xs">
          <div class="truncate font-semibold">{{ media.name }}</div>
          <div class="text-gray-500 italic truncate">{{ media.description }}</div>
        </div>
        <div class="absolute top-2 right-2 flex gap-1">
          <button @click="deleteMedia(media.id)" class="bg-white text-red-500 rounded p-1 shadow hover:bg-red-100">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const mediaList = ref([])
const searchQuery = ref('')

const fetchMedia = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.mediaList)
    mediaList.value = res.data
  } catch (err) {
    console.error('Gagal memuat media:', err)
  }
}

const deleteMedia = async (id) => {
  if (!confirm('Yakin ingin menghapus media ini?')) return
  try {
    await axios.delete(`${API_ENDPOINTS.mediaDelete}/${id}`)
    await fetchMedia()
  } catch (err) {
    console.error('Gagal menghapus media:', err)
  }
}

const isVideo = (url) => {
  return url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm')
}

const filteredMedia = computed(() =>
  mediaList.value.filter(
    m =>
      m.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (m.description || '').toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

onMounted(fetchMedia)
</script>
