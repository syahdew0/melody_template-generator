<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Kelola Konten Process Section</h1>

    <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      hanya admin yang dapat <strong>mengedit</strong> dan dapat mengubah konten.
    </p>
    
    <!-- Header Form -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div>
        <label class="font-semibold">Badge Text</label>
        <input v-model="form.badgeText" class="input" :disabled="!isAdmin" />
      </div>
      <div>
        <label class="font-semibold">Main Title</label>
        <input v-model="form.mainTitle" type="text" class="input" :disabled="!isAdmin" />
      </div>
      <div class="md:col-span-2">
        <label class="font-semibold">Subtitle</label>
        <textarea v-model="form.subtitle" rows="2" class="input" :disabled="!isAdmin"></textarea>
      </div>
    </div>

    <!-- CTA Form -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div>
        <label class="font-semibold">CTA Text</label>
        <input v-model="form.ctaText" type="text" class="input" :disabled="!isAdmin" />
      </div>
      <div>
        <label class="font-semibold">CTA Link (WA/URL)</label>
        <input v-model="form.ctaLink" type="text" class="input" :disabled="!isAdmin" />
      </div>
    </div>

    <!-- Step Items -->
    <div class="mb-8">
      <h2 class="font-semibold text-lg mb-4">Langkah-langkah Proses</h2>
      <div
        v-for="(step, index) in form.steps"
        :key="index"
        class="border p-4 rounded mb-4 relative"
      >
        <button
          v-if="isAdmin"
          @click="removeStep(index)"
          class="absolute top-2 right-2 text-red-500 font-bold"
        >×</button>

        <label class="block font-medium mb-1">Judul</label>
        <input v-model="step.title" type="text" class="input mb-2" :disabled="!isAdmin" />

        <label class="block font-medium mb-1">Deskripsi</label>
        <textarea v-model="step.desc" rows="2" class="input" :disabled="!isAdmin"></textarea>
      </div>

      <button
        @click="addStep"
        class="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
        v-if="isAdmin"
      >
        + Tambah Langkah
      </button>
    </div>

    <!-- Save Button -->
    <div class="text-right" v-if="isAdmin">
      <button
        @click="saveData"
        class="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700"
      >
        Simpan Perubahan
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const form = ref({
  badgeText: '',
  mainTitle: '',
  subtitle: '',
  ctaText: '',
  ctaLink: '',
  steps: []
})

const isAdmin = ref(false)

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user?.role === 'admin'

  try {
    const { data } = await axios.get(API_ENDPOINTS.processSection)

    form.value = {
      badgeText: data.badgeText || '',
      mainTitle: data.mainTitle || '',
      subtitle: data.subtitle || '',
      ctaText: data.ctaText || '',
      ctaLink: data.ctaLink || '',
      steps: Array.isArray(data.steps) ? data.steps : []
    }
  } catch (error) {
    console.error('Gagal memuat data process section', error)
  }
})

const addStep = () => {
  form.value.steps.push({ title: '', desc: '' })
}

const removeStep = (index) => {
  form.value.steps.splice(index, 1)
}

const saveData = async () => {
  try {
    const filteredSteps = form.value.steps.filter(
      (step) => step.title.trim() !== '' || step.desc.trim() !== ''
    )

    const payload = {
      ...form.value,
      steps: filteredSteps
    }

    await axios.put(API_ENDPOINTS.processSectionUpdate, payload)
    alert('Data berhasil disimpan!')
  } catch (error) {
    alert('Gagal menyimpan data.')
    console.error(error)
  }
}
</script>

<style scoped>
.input {
  @apply w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400;
}
</style>
