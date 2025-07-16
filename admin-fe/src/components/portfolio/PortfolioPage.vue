<template>
  <div class="p-6 space-y-8">
    <h2 class="text-2xl font-bold">Portfolio - Admin</h2>

    <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      hanya admin yang dapat <strong>mengedit</strong> dan dapat mengubah konten.
    </p>

    <!-- Header Form -->
    <div class="bg-white p-4 shadow rounded">
      <h3 class="text-lg font-semibold mb-2">Header</h3>
      <form @submit.prevent="saveHeader" class="space-y-2">
        <input v-model="header.heading" placeholder="Heading" class="input" :readonly="!isAdmin" />
        <input v-model="header.subheading" placeholder="Subheading" class="input" :readonly="!isAdmin" />
        <button v-if="isAdmin" type="submit" class="btn">Save Header</button>
      </form>
    </div>

    <!-- Image Items -->
    <div class="bg-white p-4 shadow rounded">
      <h3 class="text-lg font-semibold mb-2">Portfolio Images</h3>
      <form
        @submit.prevent="saveItem"
        class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4"
        v-if="isAdmin"
      >
        <input v-model="form.title" placeholder="Title" class="input" :readonly="!isAdmin" />
        <input v-model="form.description" placeholder="Description" class="input" :readonly="!isAdmin" />

        <!-- Media Picker Input -->
        <div class="col-span-full">
          <label class="block text-sm font-medium mb-1">Image</label>
          <div class="flex items-center gap-2 mb-2">
            <input
              v-model="form.image"
              placeholder="Pilih atau tempel URL gambar"
              class="input"
              :readonly="!isAdmin"
            />
            <button
              type="button"
              @click="showPicker = true"
              class="btn bg-gray-300 text-black hover:bg-gray-400"
              v-if="isAdmin"
            >
              Pilih
            </button>
          </div>
          <div v-if="form.image">
            <img :src="form.image" class="w-32 h-20 object-cover border rounded" />
          </div>
        </div>

        <div class="col-span-full">
          <button type="submit" class="btn">{{ form.id ? 'Update' : 'Add' }} Image</button>
          <button
            type="button"
            @click="resetForm"
            v-if="form.id"
            class="btn ml-2 bg-gray-400 hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>

      <!-- Tampilkan data -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="border p-3 rounded shadow flex flex-col bg-white"
        >
          <img :src="item.image + '?t=' + Date.now()" class="w-full object-cover rounded mb-2" />
          <div class="font-medium text-lg mb-1">{{ item.title }}</div>
          <div class="text-sm text-gray-600 mb-2">{{ item.description }}</div>

          <div v-if="isAdmin" class="mt-auto flex justify-between gap-2">
            <button @click="editItem(item)" class="btn bg-yellow-400 flex-1">Edit</button>
            <button @click="deleteItem(item.id)" class="btn bg-red-500 flex-1">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Media Picker -->
    <MediaPicker :show="showPicker" @close="showPicker = false" @select="selectImageFromPicker" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MediaPicker from '@/views/MediaPicker.vue'
import { API_ENDPOINTS } from '@/config/api'

// Tambah: cek role login
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = user.role === 'admin'

// State
const header = ref({ heading: '', subheading: '' })
const items = ref([])
const form = ref({ id: null, title: '', description: '', image: '' })
const showPicker = ref(false)

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

const selectImageFromPicker = (url) => {
  form.value.image = url
  showPicker.value = false
}

const fetchHeader = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.portfolioHeader)
    header.value = res.data || { heading: '', subheading: '' }
  } catch (err) {
    console.error('Failed to fetch header:', err)
  }
}

const fetchItems = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.portfolioItems)
    items.value = res.data
  } catch (err) {
    console.error('Failed to fetch items:', err)
  }
}

const saveItem = async () => {
  if (!isAdmin) return

  try {
    if (form.value.id) {
      await axios.put(`${API_ENDPOINTS.portfolioItems}/${form.value.id}`, form.value)
    } else {
      await axios.post(API_ENDPOINTS.portfolioItems, form.value)
    }
    resetForm()
    await delay(300)
    await fetchItems()
  } catch (err) {
    console.error('Failed to save item:', err)
  }
}

const deleteItem = async (id) => {
  if (!isAdmin) return
  if (confirm('Delete this image?')) {
    try {
      await axios.delete(`${API_ENDPOINTS.portfolioItems}/${id}`)
      await fetchItems()
    } catch (err) {
      console.error('Failed to delete item:', err)
    }
  }
}

const editItem = (item) => {
  if (!isAdmin) return
  form.value = { ...item }
}

const resetForm = () => {
  form.value = { id: null, title: '', description: '', image: '' }
}

const saveHeader = async () => {
  if (!isAdmin) return
  try {
    await axios.put(API_ENDPOINTS.portfolioHeader, header.value)
    alert('Header saved')
  } catch (err) {
    console.error('Failed to save header:', err)
  }
}

onMounted(() => {
  fetchHeader()
  fetchItems()
})
</script>

<style scoped>
.input {
  @apply border p-2 w-full rounded;
}
.btn {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700;
}
</style>
