<template>
  <div class="max-w-full mx-auto p-6 space-y-6">
    <h2 class="text-2xl font-bold mb-4">Kelola Hero Home</h2>

    <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      hanya admin yang dapat <strong>mengedit</strong> dan dapat mengubah konten.
    </p>
    
    <!-- Tipe Hero -->
    <label class="block font-semibold">Tipe Tampilan</label>
    <select v-model="form.type" class="border p-2 rounded w-full" :disabled="!isAdmin">
      <option value="static">Static</option>
      <option value="slider">Slider</option>
    </select>

    <!-- Static Form -->
    <div v-if="form.type === 'static'" class="space-y-4 border p-4 rounded bg-gray-50">
      <div>
        <label>Judul</label>
        <input v-model="form.title" class="w-full border p-2 rounded" :readonly="!isAdmin" />
      </div>
      <div>
        <label>Highlight</label>
        <input v-model="form.highlight" class="w-full border p-2 rounded" :readonly="!isAdmin" />
      </div>
      <div>
        <label>Deskripsi</label>
        <textarea v-model="form.description" class="w-full border p-2 rounded" :readonly="!isAdmin" />
      </div>
      <div>
        <label>Gambar</label>
        <div class="flex gap-2">
          <input v-model="form.imageUrl" class="w-full border p-2 rounded" :readonly="!isAdmin" />
          <button @click="openPicker('static')" class="bg-slate-500 text-white px-2 py-1 rounded" v-if="isAdmin">📁</button>
        </div>
      </div>
      <div>
        <label>CTA Text</label>
        <input v-model="form.ctaText" class="w-full border p-2 rounded" :readonly="!isAdmin" />
      </div>
      <div>
        <label>CTA Link</label>
        <input v-model="form.ctaLink" class="w-full border p-2 rounded" :readonly="!isAdmin" />
      </div>
    </div>

    <!-- Slider Form -->
    <div v-if="form.type === 'slider'" class="space-y-4 border p-4 rounded bg-gray-50">
      <div v-for="(slide, index) in form.slides" :key="index" class="p-4 border rounded relative">
        <button @click="removeSlide(index)" class="absolute top-2 right-2 text-red-600 font-bold" v-if="isAdmin">×</button>
        <div>
          <label>Judul Slide</label>
          <input v-model="slide.title" class="w-full border p-2 rounded" :readonly="!isAdmin" />
        </div>
        <div>
          <label>Deskripsi</label>
          <textarea v-model="slide.description" class="w-full border p-2 rounded" :readonly="!isAdmin" />
        </div>
        <div>
          <label>Gambar</label>
          <div class="flex gap-2">
            <input v-model="slide.imageUrl" class="w-full border p-2 rounded" :readonly="!isAdmin" />
            <button @click="openPicker(index)" class="bg-slate-500 text-white px-2 py-1 rounded" v-if="isAdmin">📁</button>
          </div>
        </div>
      </div>
      <button @click="addSlide" class="bg-blue-500 text-white px-4 py-2 rounded" v-if="isAdmin">+ Tambah Slide</button>
    </div>

    <!-- Simpan -->
    <div v-if="isAdmin">
      <button @click="save" class="bg-green-600 text-white px-6 py-3 rounded font-semibold">Simpan Perubahan</button>
    </div>

    <!-- Media Picker -->
    <MediaPicker :show="showMediaPicker" @close="showMediaPicker = false" @select="handleMediaSelected" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MediaPicker from '@/components/MediaPicker.vue'
import { API_ENDPOINTS } from '@/config/api'

const form = ref({
  type: 'static',
  title: '',
  highlight: '',
  description: '',
  imageUrl: '',
  ctaText: '',
  ctaLink: '',
  slides: []
})

const showMediaPicker = ref(false)
const mediaTarget = ref(null)

// Cek role admin
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = ref(user?.role === 'admin')

const openPicker = (target) => {
  if (!isAdmin.value) return
  mediaTarget.value = target
  showMediaPicker.value = true
}

const handleMediaSelected = (url) => {
  if (mediaTarget.value === 'static') {
    form.value.imageUrl = url
  } else if (typeof mediaTarget.value === 'number') {
    form.value.slides[mediaTarget.value].imageUrl = url
  }
  showMediaPicker.value = false
}

const fetchData = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.heroHome)
    Object.assign(form.value, {
      type: res.data.type || 'static',
      title: res.data.title || '',
      subtitle: res.data.subtitle || '',
      highlight: res.data.highlight || '',
      description: res.data.description || '',
      imageUrl: res.data.imageUrl || '',
      ctaText: res.data.ctaText || '',
      ctaLink: res.data.ctaLink || '',
      slides: Array.isArray(res.data.slides) ? res.data.slides : []
    })
  } catch (err) {
    console.error('Gagal mengambil data:', err)
  }
}

const save = async () => {
  if (!isAdmin.value) {
    alert('Hanya admin yang dapat menyimpan perubahan.')
    return
  }

  try {
    let payload = { type: form.value.type }

    if (form.value.type === 'static') {
      payload = {
        ...payload,
        title: form.value.title,
        subtitle: form.value.subtitle,
        highlight: form.value.highlight,
        description: form.value.description,
        imageUrl: form.value.imageUrl,
        ctaText: form.value.ctaText,
        ctaLink: form.value.ctaLink,
        slides: [] // tetap kosongkan
      }
    } else if (form.value.type === 'slider') {
      payload.slides = form.value.slides || []
    }

    await axios.put(API_ENDPOINTS.heroHome, payload)
    alert('Data berhasil disimpan')
  } catch (err) {
    alert('Gagal menyimpan data')
    console.error(err)
  }
}

const addSlide = () => {
  if (!isAdmin.value) return
  form.value.slides.push({ title: '', description: '', imageUrl: '' })
}

const removeSlide = (index) => {
  if (!isAdmin.value) return
  form.value.slides.splice(index, 1)
}

onMounted(fetchData)
</script>
