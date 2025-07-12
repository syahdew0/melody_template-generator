<template>
  <div class="bg-white rounded-3xl shadow-md p-8 space-y-6">
    <h2 class="text-2xl font-bold text-slate-800 mb-4">Manajemen Contact Info</h2>

    <p v-if="!isAdmin" class="text-red-500 text-sm">Hanya admin yang dapat mengubah informasi kontak ini.</p>

    <!-- Title -->
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">Judul</label>
      <input
        v-model="form.title"
        type="text"
        class="w-full rounded-xl border px-4 py-2"
        :disabled="!isAdmin"
      />
    </div>

    <!-- Deskripsi -->
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
      <textarea
        v-model="form.description"
        class="w-full rounded-xl border px-4 py-2"
        rows="3"
        :disabled="!isAdmin"
      ></textarea>
    </div>

    <!-- Items -->
    <div
      v-for="(item, index) in form.items"
      :key="index"
      class="border p-4 rounded-xl space-y-2 bg-slate-50 relative"
    >
      <button
        v-if="isAdmin"
        @click="removeItem(index)"
        class="absolute top-2 right-2 text-red-500 hover:text-red-600"
      >
        ✕
      </button>

      <div>
        <label class="block text-sm font-medium">Icon</label>
        <select
          v-model="item.icon"
          class="w-full border rounded-xl px-4 py-2"
          :disabled="!isAdmin"
        >
          <option disabled value="">Pilih Icon</option>
          <option v-for="icon in iconOptions" :key="icon" :value="icon">{{ icon }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium">Judul</label>
        <input
          v-model="item.title"
          type="text"
          class="w-full rounded-xl border px-4 py-2"
          :disabled="!isAdmin"
        />
      </div>

      <div>
        <label class="block text-sm font-medium">Isi Teks</label>
        <textarea
          v-model="item.text"
          class="w-full rounded-xl border px-4 py-2"
          rows="3"
          :disabled="!isAdmin"
        ></textarea>
      </div>
    </div>

    <!-- Tambah Item -->
    <button
      v-if="isAdmin"
      @click="addItem"
      class="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600"
    >
      + Tambah Item
    </button>

    <!-- Gambar Ilustrasi -->
    <div>
      <label class="block text-sm font-medium mb-1">Gambar Ilustrasi</label>

      <button
        v-if="isAdmin"
        @click="showMediaPicker = true"
        class="mb-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600"
      >
        Pilih dari Media
      </button>

      <div v-if="form.image" class="mb-2">
        <img :src="form.image" alt="Preview" class="max-h-32 rounded-xl border" />
      </div>

      <input
        v-model="form.image"
        type="text"
        placeholder="Atau masukkan URL gambar secara manual"
        class="w-full px-4 py-2 border rounded-xl"
        :disabled="!isAdmin"
      />

      <MediaPicker
      :show="showMediaPicker"
      @select="handleImageSelect"
      @close="showMediaPicker = false"
    />
    </div>

    <!-- Simpan -->
    <div class="pt-4" v-if="isAdmin">
      <button
        @click="submitForm"
        class="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900"
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
import MediaPicker from '../MediaPicker.vue'

const isAdmin = ref(false)
const showMediaPicker = ref(false)

const form = ref({
  title: '',
  description: '',
  image: '',
  items: []
})

const iconOptions = [
  'PhoneIcon',
  'EnvelopeIcon',
  'MapPinIcon',
  'GlobeAltIcon',
  'BuildingOfficeIcon'
]

const fetchData = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.contactSettings)
    const data = res?.data?.contactInfo ?? {
      title: '',
      description: '',
      image: '',
      items: []
    }

    form.value.title = data.title
    form.value.description = data.description
    form.value.image = data.image
    form.value.items = Array.isArray(data.items) ? data.items : []
  } catch (err) {
    console.error('Gagal memuat data:', err)
  }
}


const handleImageSelect = (url) => {
  form.value.image = url
  showMediaPicker.value = false
}

const addItem = () => {
  form.value.items.push({ icon: '', title: '', text: '' })
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
}

const submitForm = async () => {
  try {
    const cleanItems = form.value.items.filter(item =>
      item.title.trim() || item.text.trim() || item.icon.trim()
    )

    const payload = {
      title: form.value.title,
      description: form.value.description,
      image: form.value.image,
      items: cleanItems
    }

    await axios.put(API_ENDPOINTS.contactSettings, { contactInfo: payload })
    alert('Data berhasil disimpan!')
  } catch (err) {
    console.error('Gagal menyimpan data:', err)
    alert('Terjadi kesalahan saat menyimpan.')
  }
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user?.role === 'admin'
  fetchData()
})
</script>
