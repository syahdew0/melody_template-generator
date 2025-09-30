<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Manajemen Tema</h1>

    <!-- Tombol Tambah Theme -->
    <div class="mb-4">
      <button @click="showAddModal = true" class="px-4 py-2 bg-green-600 text-white rounded">
        + Tambahkan Theme
      </button>
    </div>

    <!-- Tabel Theme -->
    <table class="w-full table-auto border mb-4" v-if="themes.length > 0">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-4 py-2 text-center">Nama Theme</th>
          <th class="border px-4 py-2 text-center">Slug</th>
          <th class="border px-4 py-2 text-center">Status</th>
          <th class="border px-4 py-2 text-center">Aksi</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="theme in themes" :key="theme.id">
          <td class="border px-4 py-2">{{ theme.name }}</td>
          <td class="border px-4 py-2">{{ theme.slug }}</td>

          <!-- Tombol status satu toggle -->
          <td class="border px-4 py-2 text-center">
            <button
              @click="setActive(theme.id)"
              :class="theme.is_active ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'"
              class="px-3 py-1 rounded"
            >
              {{ theme.is_active ? 'Aktif' : 'Tidak Aktif' }}
            </button>
          </td>

          <td class="border px-4 py-2 space-y-2">
            <div>
              <router-link
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
      Tidak ada theme.
    </div>

    <!-- Modal Tambah Theme -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-lg w-96 p-6">
        <h2 class="text-xl font-bold mb-4">Tambah Theme</h2>

        <label class="block mb-2">Pilih Theme dari Manifest:</label>
        <select v-model="selectedThemeSlug" class="w-full border rounded px-2 py-1 mb-4">
          <option disabled value="">-- Pilih Theme --</option>
          <option
            v-for="item in availableThemes"
            :key="item.slug"
            :value="item.slug"
          >
            {{ item.name }}
          </option>
        </select>

        <div class="flex justify-end gap-2">
          <button @click="showAddModal = false" class="px-3 py-1 bg-gray-400 text-white rounded">Batal</button>
          <button @click="addTheme" :disabled="!selectedThemeSlug" class="px-3 py-1 bg-blue-600 text-white rounded">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api, API_ENDPOINTS } from '@/config/api'

const websiteId = 1
const themes = ref([])

const showAddModal = ref(false)
const selectedThemeSlug = ref('')
const manifest = ref({ themes: {} })

// Load manifest
// const fetchManifest = async () => {
//   try {
//     const res = await fetch('/manifest.html')
//     const text = await res.text()
//     manifest.value = JSON.parse(text)
//   } catch (err) {
//     console.error('Gagal load manifest:', err)
//   }
// }

const fetchManifest = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.manifestThemes) 
    manifest.value = res.data
  } catch (err) {
    console.error('Gagal load manifest:', err)
  }
}

// Load daftar theme dari backend
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
  try {
    await api.put(API_ENDPOINTS.setActiveTheme(id))
    themes.value.forEach(t => { t.is_active = t.id === id })
    alert('Theme berhasil dijadikan aktif')
  } catch (err) {
    console.error('Gagal set aktif:', err)
    alert('Gagal mengganti theme aktif.')
  }
}

// Tambah theme dari manifest
const addTheme = async () => {
  if (!selectedThemeSlug.value) return
  const selected = manifest.value.themes[selectedThemeSlug.value]
  if (!selected) return

  try {
    await api.post(API_ENDPOINTS.themes, {
      website_id: websiteId,
      slug: selected.slug,
      name: selected.name,
      path: selected.path,
      files: selected.files
    })
    alert(`Theme ${selected.name} berhasil ditambahkan.`)
    showAddModal.value = false
    selectedThemeSlug.value = ''
    fetchThemes()
  } catch (err) {
    console.error('Gagal menambahkan theme:', err)
    alert('Gagal menambahkan theme.')
  }
}

// Filter theme yang belum ada di DB
const availableThemes = computed(() => {
  const existingSlugs = themes.value.map(t => t.slug)
  return Object.values(manifest.value.themes || {}).filter(
    t => !existingSlugs.includes(t.slug)
  )
})

onMounted(async () => {
  await fetchManifest()
  await fetchThemes()
})
</script>
