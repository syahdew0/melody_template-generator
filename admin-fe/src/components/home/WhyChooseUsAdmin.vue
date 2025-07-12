<template>
  <div class="p-6 space-y-8">
    <div v-if="section">
      <!-- Header -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold">Header Why Choose Us</h2>
        <input
          v-model="section.heading"
          placeholder="Judul"
          class="w-full p-2 border rounded"
          :disabled="!isAdmin"
        />
        <textarea
          v-model="section.subHeading"
          placeholder="Deskripsi"
          class="w-full p-2 border rounded"
          :disabled="!isAdmin"
        ></textarea>
        <button
          v-if="isAdmin"
          @click="saveHeader"
          class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded"
        >
          Simpan Header
        </button>
        <p v-else class="text-sm text-red-500">Hanya admin yang bisa mengedit header.</p>
      </div>

      <!-- Benefit Items -->
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold">Benefit Items</h2>
        <div
          v-for="(item) in section.benefits"
          :key="item.id"
          class="p-4 border rounded-md shadow-sm space-y-2 bg-white"
        >
          <input
            v-model="item.title"
            placeholder="Judul"
            class="w-full p-2 border rounded"
            :disabled="!isAdmin"
          />
          <textarea
            v-model="item.desc"
            placeholder="Deskripsi"
            class="w-full p-2 border rounded"
            :disabled="!isAdmin"
          ></textarea>
          <select v-model="item.icon" class="w-full p-2 border rounded" :disabled="!isAdmin">
            <option value="Home">Home</option>
            <option value="Ruler">Ruler</option>
            <option value="ShieldCheck">ShieldCheck</option>
            <option value="Users">Users</option>
          </select>

          <div class="flex justify-between" v-if="isAdmin">
            <button @click="updateBenefit(item)" class="text-blue-600">Update</button>
            <button @click="deleteBenefit(item.id)" class="text-red-600">Hapus</button>
          </div>
        </div>

        <button
          v-if="isAdmin"
          @click="addBenefit"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Tambah Benefit
        </button>

        <p v-else class="text-sm text-red-500">Hanya admin yang bisa mengubah daftar benefit.</p>
      </div>
    </div>

    <div v-else>
      <p>Loading data...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const section = ref({
  heading: '',
  subHeading: '',
  benefits: []
})

// Ganti ini:
const isAdmin = ref(false)
const user = JSON.parse(localStorage.getItem('user') || '{}')
isAdmin.value = user?.role === 'admin'

const fetchData = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.whyChooseUs)
    section.value.heading = res.data.header?.title || ''
    section.value.subHeading = res.data.header?.subtitle || ''
    section.value.benefits = res.data.benefits || []
  } catch (error) {
    console.error('Gagal memuat data:', error)
  }
}

const saveHeader = async () => {
  if (!isAdmin.value) return
  try {
    await axios.put(API_ENDPOINTS.whyChooseUsHeader, {
      title: section.value.heading,
      subtitle: section.value.subHeading
    })
    alert('Header disimpan!')
  } catch (error) {
    console.error('Gagal menyimpan header:', error)
  }
}

const updateBenefit = async (item) => {
  if (!isAdmin.value) return
  try {
    await axios.put(`${API_ENDPOINTS.whyChooseUsBenefit}/${item.id}`, item)
    alert('Benefit diperbarui!')
  } catch (error) {
    console.error('Gagal update benefit:', error)
  }
}

const deleteBenefit = async (id) => {
  if (!isAdmin.value) return
  if (confirm('Yakin ingin menghapus benefit ini?')) {
    try {
      await axios.delete(`${API_ENDPOINTS.whyChooseUsBenefit}/${id}`)
      section.value.benefits = section.value.benefits.filter(b => b.id !== id)
    } catch (error) {
      console.error('Gagal hapus benefit:', error)
    }
  }
}

const addBenefit = async () => {
  if (!isAdmin.value) return
  try {
    const newItem = { title: 'Judul Baru', desc: 'Deskripsi baru', icon: 'Home' }
    const res = await axios.post(API_ENDPOINTS.whyChooseUsBenefit, newItem)
    section.value.benefits.push(res.data)
  } catch (error) {
    console.error('Gagal tambah benefit:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
textarea {
  min-height: 80px;
}
</style>
