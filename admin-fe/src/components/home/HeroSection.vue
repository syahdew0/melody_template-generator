<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Hero Section Management</h1>

    <!-- Hanya Admin Bisa Tambah / Edit -->
    <form
      v-if="isAdmin"
      @submit.prevent="saveHero"
      class="bg-white shadow-md rounded p-4 mb-6"
    >
      <h2 class="text-lg font-semibold mb-2">{{ isEdit ? 'Edit Hero' : 'Tambah Hero' }}</h2>

      <div class="mb-4">
        <label class="block text-sm font-medium">Judul</label>
        <input v-model="form.title" type="text" class="w-full border rounded p-2" required />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium">Deskripsi</label>
        <textarea v-model="form.description" class="w-full border rounded p-2" rows="4" required />
      </div>

      <div class="flex gap-2">
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {{ isEdit ? 'Update' : 'Simpan' }}
        </button>
        <button
          v-if="isEdit"
          type="button"
          @click="resetForm"
          class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Batal
        </button>
      </div>
    </form>

    <p v-else class="text-red-500 text-sm mb-6">
      Hanya admin yang dapat menambah atau mengedit data hero.
    </p>

    <!-- Daftar Hero -->
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
            <td class="p-3 border-b">{{ hero.title }}</td>
            <td class="p-3 border-b">{{ hero.description }}</td>
            <td class="p-3 border-b">
              <template v-if="isAdmin">
                <button @click="editHero(hero)" class="text-blue-600 hover:underline mr-2">Edit</button>
                <button @click="deleteHero(hero.id)" class="text-red-600 hover:underline">Hapus</button>
              </template>
              <template v-else>
                <span class="italic text-gray-400">Read-only</span>
              </template>
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
import { API_ENDPOINTS } from '@/config/api'

const heroes = ref([])
const form = ref({
  title: '',
  description: ''
})
const isEdit = ref(false)
const currentId = ref(null)
const isAdmin = ref(false)

const fetchHeroes = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.heroHome)
    heroes.value = Array.isArray(res.data) ? res.data : [res.data]
  } catch (err) {
    console.error('Gagal mengambil data hero:', err.response?.data || err.message)
  }
}

const fetchUser = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.authMe)
    isAdmin.value = res.data?.role === 'admin'
  } catch (err) {
    console.error('Gagal mengambil data user:', err)
  }
}

const saveHero = async () => {
  try {
    if (isEdit.value) {
      await axios.put(API_ENDPOINTS.heroHome, form.value)
    } else {
      await axios.post(API_ENDPOINTS.heroHome, form.value)
    }
    await fetchHeroes()
    resetForm()
  } catch (err) {
    console.error('Gagal menyimpan:', err.response?.data || err.message)
  }
}

const editHero = (hero) => {
  form.value = {
    title: hero.title,
    description: hero.description
  }
  currentId.value = hero.id
  isEdit.value = true
}

const deleteHero = async (id) => {
  if (!confirm('Yakin ingin menghapus hero ini?')) return
  try {
    await axios.delete(`${API_ENDPOINTS.heroHome}/${id}`)
    await fetchHeroes()
  } catch (err) {
    console.error('Gagal menghapus:', err.response?.data || err.message)
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    description: ''
  }
  currentId.value = null
  isEdit.value = false
}

onMounted(() => {
  fetchUser()
  fetchHeroes()
})
</script>
