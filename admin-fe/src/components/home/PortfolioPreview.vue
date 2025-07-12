<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-slate-700">Portfolio Preview Admin</h2>

    <!-- HERO SECTION -->
    <section class="mb-10">
      <h3 class="text-lg font-semibold mb-2 text-amber-700">Hero Section</h3>
      <input v-model="form.hero.title" type="text" placeholder="Title" class="input" :readonly="!isAdmin" />
      <textarea v-model="form.hero.description" placeholder="Description" class="input h-24" :readonly="!isAdmin" />
    </section>

    <!-- CTA SECTION -->
    <section class="mb-10">
      <h3 class="text-lg font-semibold mb-2 text-amber-700">CTA Section</h3>
      <input v-model="form.cta.cta1Label" type="text" placeholder="CTA 1 Label" class="input" :readonly="!isAdmin" />
      <input v-model="form.cta.cta1Path" type="text" placeholder="CTA 1 Path" class="input" :readonly="!isAdmin" />
      <input v-model="form.cta.cta2Label" type="text" placeholder="CTA 2 Label" class="input" :readonly="!isAdmin" />
      <input v-model="form.cta.cta2Link" type="text" placeholder="CTA 2 Link" class="input" :readonly="!isAdmin" />
      <textarea v-model="form.cta.description" placeholder="CTA Description" class="input h-24" :readonly="!isAdmin" />
    </section>

    <!-- PROJECTS -->
    <section class="mb-10">
      <h3 class="text-lg font-semibold mb-4 text-amber-700">Projects</h3>

      <div
        v-for="(project, index) in form.projects"
        :key="project.id || index"
        class="border p-4 rounded-lg mb-4 bg-white shadow-sm"
      >
        <input v-model="project.title" type="text" placeholder="Title" class="input" :readonly="!isAdmin" />
        <textarea v-model="project.description" placeholder="Description" class="input h-20" :readonly="!isAdmin" />

        <!-- Input image + Media Picker -->
        <div>
          <label class="block text-sm text-gray-600 mb-1">Image</label>
          <div class="flex items-center space-x-2">
            <input
              v-model="project.image"
              type="text"
              placeholder="Image URL"
              class="input flex-1 mb-0"
              :readonly="!isAdmin"
            />
            <button
              v-if="isAdmin"
              type="button"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              @click="openMediaPicker(index)"
            >
              Pilih
            </button>
          </div>
          <div v-if="project.image" class="mt-2">
            <img :src="project.image" alt="Preview" class="h-24 rounded border" />
          </div>
        </div>

        <input
          v-model="project.tagsStr"
          type="text"
          placeholder="Tags (comma separated)"
          class="input"
          :readonly="!isAdmin"
        />
        <button
          v-if="isAdmin"
          @click="removeProject(index)"
          class="text-red-500 mt-2"
        >Remove</button>
      </div>

      <button
        v-if="isAdmin"
        @click="addProject"
        class="bg-amber-500 text-white px-4 py-2 rounded shadow hover:bg-amber-600 transition"
      >
        + Add Project
      </button>
    </section>

    <!-- SUBMIT BUTTON -->
    <div class="text-right" v-if="isAdmin">
      <button @click="saveChanges" class="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700 transition">
        Save All Changes
      </button>
    </div>

    <!-- Media Picker Modal -->
    <MediaPicker
      v-if="showMediaPicker"
      :show="showMediaPicker"
      @select="onMediaSelected"
      @close="showMediaPicker = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'
import MediaPicker from '@/components/MediaPicker.vue'

const form = ref({
  hero: { title: '', description: '' },
  cta: {
    cta1Label: '',
    cta1Path: '',
    cta2Label: '',
    cta2Link: '',
    description: '',
  },
  projects: [],
})

const showMediaPicker = ref(false)
const selectedProjectIndex = ref(null)
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = ref(user.role === 'admin')

const openMediaPicker = (index) => {
  selectedProjectIndex.value = index
  showMediaPicker.value = true
}

const onMediaSelected = (url) => {
  if (selectedProjectIndex.value !== null) {
    form.value.projects[selectedProjectIndex.value].image = url
    showMediaPicker.value = false
    selectedProjectIndex.value = null
  }
}

onMounted(async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.portfolioPreview)

    form.value.hero = typeof res.data.hero === 'string' ? JSON.parse(res.data.hero) : res.data.hero
    form.value.cta = typeof res.data.cta === 'string' ? JSON.parse(res.data.cta) : res.data.cta
    form.value.projects = res.data.projects.map(project => ({
      ...project,
      tagsStr: (project.tags || []).join(', ')
    }))
  } catch (err) {
    console.error('Gagal memuat data:', err)
  }
})

const addProject = () => {
  if (!isAdmin.value) return
  form.value.projects.push({
    title: '',
    description: '',
    image: '',
    tagsStr: '',
  })
}

const removeProject = (index) => {
  if (!isAdmin.value) return
  form.value.projects.splice(index, 1)
}

const saveChanges = async () => {
  if (!isAdmin.value) return
  try {
    const processedProjects = form.value.projects.map(p => ({
      ...p,
      tags: p.tagsStr.split(',').map(t => t.trim()).filter(Boolean),
    }))

    const payload = {
      hero: form.value.hero,
      cta: form.value.cta,
      projects: processedProjects,
    }

    await axios.put(API_ENDPOINTS.portfolioPreview, payload)
    alert('Berhasil disimpan!')
  } catch (err) {
    console.error('Gagal menyimpan:', err)
    alert('Gagal menyimpan data.')
  }
}
</script>

<style scoped>
.input {
  @apply w-full px-4 py-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-400;
}
</style>
