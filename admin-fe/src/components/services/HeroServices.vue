<template>
  <div class="max-w-full mx-auto p-6 bg-white rounded shadow">
    <h2 class="text-2xl font-semibold mb-4">Edit Hero Services</h2>
    
    <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      hanya admin yang dapat <strong>mengedit</strong> dan dapat mengubah konten.
    </p>

    <form @submit.prevent="saveHero">
      <div class="grid grid-cols-1 gap-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Title</label>
          <input v-model="form.title" type="text" class="mt-1 block w-full border rounded-md shadow-sm" />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Description</label>
          <input v-model="form.description" type="text" class="mt-1 block w-full border rounded-md shadow-sm" />
        </div>

        <!-- Heading Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Heading Title</label>
          <input v-model="form.headingTitle" type="text" class="mt-1 block w-full border rounded-md shadow-sm" />
        </div>

        <!-- Heading Subtitle -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Heading Subtitle</label>
          <input v-model="form.headingSubtitle" type="text" class="mt-1 block w-full border rounded-md shadow-sm" />
        </div>

        <!-- CTA 1 Label -->
        <div>
          <label class="block text-sm font-medium text-gray-700">CTA 1 Label</label>
          <input v-model="form.cta1Label" type="text" class="mt-1 block w-full border rounded-md shadow-sm" />
        </div>

        <!-- CTA 1 Link -->
        <div>
          <label class="block text-sm font-medium text-gray-700">CTA 1 Link (URL)</label>
          <input v-model="form.cta1Link" type="text" class="mt-1 block w-full border rounded-md shadow-sm" />
        </div>

        <!-- CTA 2 Label -->
        <div>
          <label class="block text-sm font-medium text-gray-700">CTA 2 Label</label>
          <input v-model="form.cta2Label" type="text" class="mt-1 block w-full border rounded-md shadow-sm" />
        </div>

        <!-- CTA 2 Path -->
        <div>
          <label class="block text-sm font-medium text-gray-700">CTA 2 Path (Internal Route)</label>
          <input v-model="form.cta2Path" type="text" class="mt-1 block w-full border rounded-md shadow-sm" />
        </div>
      </div>

      <!-- Feedback -->
      <p v-if="successMessage" class="text-green-600 mt-2">{{ successMessage }}</p>

      <!-- Button -->
      <div class="mt-6" v-if="isAdmin">
        <button
          type="submit"
          class="px-6 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          :disabled="loading"
        >
          {{ loading ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const form = ref({
  title: '',
  description: '',
  headingTitle: '',
  headingSubtitle: '',
  cta1Label: '',
  cta1Link: '',
  cta2Label: '',
  cta2Path: ''
})

const successMessage = ref('')
const loading = ref(false)
const isAdmin = ref(false)

const fetchHero = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.heroServices)
    if (res.data) {
      Object.assign(form.value, res.data)
    }
  } catch (err) {
    console.error('Gagal mengambil data Hero Services:', err)
  }
}

const saveHero = async () => {
  if (!isAdmin.value) return
  loading.value = true
  try {
    await axios.put(API_ENDPOINTS.heroServices, form.value)
    successMessage.value = 'Data berhasil disimpan!'
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    console.error('Gagal menyimpan data Hero Services:', err)
    alert('Gagal menyimpan data.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
   const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user?.role === 'admin'
  fetchHero()
})
</script>
