<template>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Manajemen Tema</h1>
  
      <table class="w-full table-auto border mb-4">
        <thead>
          <tr class="bg-gray-100">
            <th class="border px-4 py-2 text-left">Nama Theme</th>
            <th class="border px-4 py-2 text-left">Slug</th>
            <th class="border px-4 py-2 text-left">Status</th>
            <th class="border px-4 py-2 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="theme in themes" :key="theme.id">
            <td class="border px-4 py-2">{{ theme.name }}</td>
            <td class="border px-4 py-2">{{ theme.slug }}</td>
            <td class="border px-4 py-2">
              <span :class="theme.is_active ? 'text-green-600 font-bold' : 'text-gray-500'">
                {{ theme.is_active ? 'Aktif' : 'Tidak Aktif' }}
              </span>
            </td>
            <td class="border px-4 py-2">
              <button
                v-if="!theme.is_active"
                @click="setActive(theme.id)"
                class="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Jadikan Aktif
              </button>
              <span v-else class="text-sm italic text-green-600">Aktif</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import API_ENDPOINTS from '@/config/api'
  import { useToast } from 'vue-toastification'
  
  const toast = useToast()

  const websiteId = 1 // bisa dinamis
  const themes = ref([])
  
  const fetchThemes = async () => {
    const res = await axios.get(`${API_ENDPOINTS.themes}?website_id=${websiteId}`)
    themes.value = res.data.themes
  }
  
  const setActive = async (id) => {
    try {
      await axios.put(`${API_ENDPOINTS.setActiveTheme(id)}`)
      await fetchThemes()
      toast.success('Theme berhasil dijadikan aktif.')
    } catch (err) {
      console.error('Gagal set aktif:', err)
      toast.error('Gagal mengganti theme aktif.')
    }
  }
  
  onMounted(() => {
    fetchThemes()
  })
  </script>
  