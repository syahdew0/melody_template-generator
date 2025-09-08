<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Manajemen Tema</h1>

    <table class="w-full table-auto border mb-4" v-if="permissions.canView && themes.length > 0">
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
          <td class="border px-4 py-2 space-y-2">
            <div>
              <button
                v-if="!theme.is_active && permissions.canEdit"
                @click="setActive(theme.id)"
                class="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Jadikan Aktif
              </button>
              <span v-else-if="theme.is_active" class="text-sm italic text-green-600">Aktif</span>
            </div>

            <div>
              <router-link
                v-if="permissions.canEdit"
                :to="{ name: 'SchemaEditor', query: { theme_id: theme.id } }"
                class="px-3 py-1 bg-blue-500 text-white rounded inline-block"
              >
                Edit Schema
              </router-link>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="text-center py-6 text-gray-500">
      {{ permissions.canView ? 'Tidak ada theme.' : 'Anda tidak memiliki izin untuk melihat theme.' }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api, API_ENDPOINTS } from '@/config/api'

const websiteId = 1
const themes = ref([])
const permissions = ref({
  canView: false,
  canEdit: false,
  canAdd: false,
  canDelete: false
})

// Fetch themes dari API
const fetchThemes = async () => {
  try {
    const res = await api.get(`${API_ENDPOINTS.themes}?website_id=${websiteId}`)
    themes.value = res.data.themes || []
  } catch (err) {
    console.error('Gagal fetch themes:', err)
  }
}

// Set theme aktif
const setActive = async (id) => {
  if (!permissions.value.canEdit) return
  try {
    await api.put(API_ENDPOINTS.setActiveTheme(id))
    await fetchThemes()
    alert('Theme berhasil dijadikan aktif.')
  } catch (err) {
    console.error('Gagal set aktif:', err)
    alert('Gagal mengganti theme aktif.')
  }
}

// Ambil permissions user
const fetchPermissions = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.userPermissions)
    const themeKey = Object.keys(res.data).find(k => k.toLowerCase() === 'theme')
    permissions.value = themeKey
      ? res.data[themeKey]
      : { canView: false, canEdit: false, canAdd: false, canDelete: false }
  } catch (err) {
    console.error('Gagal fetch permissions:', err)
    permissions.value = { canView: false, canEdit: false, canAdd: false, canDelete: false }
  }
}

onMounted(async () => {
  await fetchPermissions()
  if (permissions.value.canView) {
    await fetchThemes()
  } else {
    alert('Anda tidak memiliki izin untuk melihat tema.')
  }
})
</script>
