<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Hero Section About</h1>
    <form @submit.prevent="saveHero" class="bg-white shadow-md rounded p-4 mb-6">
      <h2 class="text-lg font-semibold mb-2">{{ isEdit ? 'Edit Hero' : 'Tambah Hero' }}</h2>

      <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      hanya admin yang dapat <strong>mengedit</strong> dan dapat mengubah konten.
    </p>
    
      <div class="mb-4">
        <label class="block text-sm font-medium">Judul Header</label>
        <input v-model="form.header" class="w-full border rounded p-2" placeholder="Header" :disabled="!isAdmin"/>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium">Teks Tombol</label>
        <input v-model="form.title" class="w-full border rounded p-2" placeholder="Button" :disabled="!isAdmin"/>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium">Deskripsi</label>
        <textarea v-model="form.description" class="w-full border rounded p-2" rows="4" :disabled="!isAdmin"></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Gambar</label>
        <div class="flex items-center gap-2 mb-2">
          <input  v-model="form.image" type="text" class="w-full border rounded p-2" placeholder="Pilih atau tempel URL gambar" />
          <button v-if="isAdmin" type="button" @click="showPicker = true" class="text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">Pilih</button>
        </div>
        <div v-if="form.image" class="mb-4">
          <img :src="form.image" class="w-32 h-20 object-cover border rounded" />
        </div>
        <MediaPicker :show="showPicker" @close="showPicker = false" @select="selectImageFromPicker" :disabled="!isAdmin"/>
      </div>

      <div class="flex gap-2">
        <button v-if="isAdmin" type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {{ isEdit ? 'Update' : 'Simpan' }}
        </button>
        <button v-if="isEdit && isAdmin" type="button" @click="resetForm" class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
          Batal
        </button>
      </div>
    </form>

    <div class="bg-white shadow-md rounded">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 border-b">#</th>
            <th class="p-3 border-b">Judul</th>
            <th class="p-3 border-b">Deskripsi</th>
            <th class="p-3 border-b">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(hero, index) in heroes" :key="hero.id">
            <td class="p-3 border-b">{{ index + 1 }}</td>
            <td class="p-3 border-b">{{ hero.header }}</td>
            <td class="p-3 border-b">{{ hero.description }}</td>
            <td class="p-3 border-b">
              <button v-if="isAdmin" @click="editHero(hero)" class="text-blue-600 hover:underline mr-2">Edit</button>
              <button v-if="isAdmin" @click="deleteHero(hero.id)" class="text-red-600 hover:underline">Hapus</button>
            </td>
          </tr>
          <tr v-if="heroes.length === 0">
            <td colspan="4" class="text-center p-3">Belum ada data hero.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MediaPicker from '@/components/MediaPicker.vue'
import { API_ENDPOINTS } from '@/config/api'

const showPicker = ref(false)
const heroes = ref([])
const isEdit = ref(false)
const isAdmin = ref(false)
const form = ref({
  id: null,
  title: '',
  header: '',
  description: '',
  image: ''
})

const selectImageFromPicker = (url) => {
  form.value.image = url
  showPicker.value = false
}

const fetchHeroes = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.heroAbout)
    heroes.value = res.data
  } catch (err) {
    console.error('Gagal mengambil data Hero:', err)
  }
}

const saveHero = async () => {
  try {
    if (isEdit.value) {
      await axios.put(API_ENDPOINTS.heroAboutDetail(form.value.id), form.value)
    } else {
      await axios.post(API_ENDPOINTS.heroAbout, form.value)
    }
    await fetchHeroes()
    resetForm()
  } catch (err) {
    console.error('Gagal menyimpan Hero:', err)
    alert('Gagal menyimpan Hero: ' + (err.response?.data?.message || err.message))
  }
}

const editHero = (hero) => {
  form.value = { ...hero }
  isEdit.value = true
}

const deleteHero = async (id) => {
  if (confirm('Yakin ingin menghapus hero ini?')) {
    try {
      await axios.delete(API_ENDPOINTS.heroAboutDetail(id))
      await fetchHeroes()
    } catch (err) {
      console.error('Gagal menghapus hero:', err)
      alert('Gagal menghapus hero')
    }
  }
}

const resetForm = () => {
  form.value = {
    id: null,
    title: '',
    header: '',
    description: '',
    image: ''
  }
  isEdit.value = false
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user?.role === 'admin'
  fetchHeroes()
})
</script>
