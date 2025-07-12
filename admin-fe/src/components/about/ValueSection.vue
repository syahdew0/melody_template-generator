<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">Kelola Value Cards</h2>

    <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      hanya admin yang dapat <strong>mengedit</strong> dan dapat mengubah konten.
    </p>
    
    <form @submit.prevent="saveItem">
      <input v-model="form.title" placeholder="Title" class="input" />
      <input v-model="form.description" placeholder="Description" class="input" />
      <input v-model="form.label" placeholder="Label" class="input" />
      <button v-if="isAdmin" class="btn bg-amber-500 text-white">{{ isEdit ? 'Update' : 'Create' }}</button>
    </form>

    <ul class="mt-6">
      <li v-for="item in items" :key="item.id" class="border-b py-2 flex justify-between">
        <div>
          <strong>{{ item.title }}</strong> - {{ item.label }}
        </div>
        <div>
          <button v-if="isAdmin" @click="edit(item)" class="text-blue-500 mr-2">Edit</button>
          <button v-if="isAdmin" @click="del(item.id)" class="text-red-500">Hapus</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const form = ref({ title: '', description: '', label: '' })
const isEdit = ref(false)
const editId = ref(null)
const items = ref([])
const isAdmin = ref(false)

// Fungsi untuk load data dari backend
const loadData = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.valueSection)
    items.value = res.data
  } catch (error) {
    console.error('Gagal memuat data:', error)
  }
}

// Fungsi simpan data (create atau update)
const saveItem = async () => {
  try {
    if (isEdit.value) {
      await axios.put(API_ENDPOINTS.valueSectionDetail(editId.value), form.value)
    } else {
      await axios.post(API_ENDPOINTS.valueSection, form.value)
    }

    resetForm()
    await loadData()
  } catch (error) {
    console.error('Gagal menyimpan item:', error)
  }
}

// Fungsi edit data
const edit = (item) => {
  form.value = {
    title: item.title,
    description: item.description,
    label: item.label,
  }
  editId.value = item.id
  isEdit.value = true
}

// Fungsi hapus data
const del = async (id) => {
  try {
    await axios.delete(API_ENDPOINTS.valueSectionDetail(id))
    await loadData()
  } catch (error) {
    console.error('Gagal menghapus item:', error)
  }
}

// Reset form setelah submit
const resetForm = () => {
  form.value = { title: '', description: '', label: '' }
  isEdit.value = false
  editId.value = null
}

// Panggil data saat component dimount
onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user?.role === 'admin'
  loadData()
})
</script>

<style scoped>
.input {
  @apply block w-full border rounded p-2 mb-2;
}
</style>
