<template>
  <div class="p-6 space-y-6 bg-white rounded-3xl shadow-lg">
    <h1 class="text-2xl font-bold text-slate-800">Pengaturan Footer</h1>

    <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      hanya admin yang dapat <strong>mengedit</strong> dan dapat mengubah konten.
    </p>
    
    <!-- Logo Upload -->
    <div>
      <label class="font-semibold">Logo</label>
      <div class="flex items-center gap-4 mt-2">
        <img v-if="form.logo" :src="form.logo" alt="Logo" class="h-12 rounded border" />
        <button
          v-if="isAdmin"
          @click="openMediaModal"
          class="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Pilih dari Media
        </button>
      </div>
    </div>

    <!-- Brand & Deskripsi -->
    <div>
      <label class="font-semibold">Brand</label>
      <input
        v-model="form.brand"
        class="w-full p-2 border rounded mt-1"
        :disabled="!isAdmin"
      />
      <label class="font-semibold mt-4 block">Deskripsi</label>
      <textarea
        v-model="form.description"
        rows="3"
        class="w-full p-2 border rounded mt-1"
        :disabled="!isAdmin"
      />
    </div>

    <!-- Navigasi -->
    <div>
      <label class="flex items-center gap-2 font-semibold">
        <input type="checkbox" v-model="form.layoutOptions.showNavigation" :disabled="!isAdmin" />
        Tampilkan Navigasi
      </label>
      <div v-if="form.layoutOptions.showNavigation" class="mt-2 space-y-2">
        <div
          v-for="(item, i) in form.navigation"
          :key="i"
          class="flex gap-2 items-center"
        >
          <input v-model="item.label" placeholder="Label" class="flex-1 p-2 border rounded" :disabled="!isAdmin" />
          <input v-model="item.link" placeholder="Link" class="flex-1 p-2 border rounded" :disabled="!isAdmin" />
          <button v-if="isAdmin" @click="form.navigation.splice(i, 1)" class="text-red-500">Hapus</button>
        </div>
        <button
          v-if="isAdmin"
          @click="form.navigation.push({ label: '', link: '' })"
          class="mt-2 text-sm text-blue-600"
        >
          + Tambah Navigasi
        </button>
      </div>
    </div>

    <!-- Kontak -->
    <div>
      <label class="flex items-center gap-2 font-semibold">
        <input type="checkbox" v-model="form.layoutOptions.showContact" :disabled="!isAdmin" />
        Tampilkan Kontak
      </label>
      <div v-if="form.layoutOptions.showContact" class="mt-2">
        <input v-model="form.contact.address" placeholder="Alamat" class="w-full p-2 border rounded mb-2" :disabled="!isAdmin" />
        <input v-model="form.contact.phone" placeholder="Telepon" class="w-full p-2 border rounded mb-2" :disabled="!isAdmin" />
        <input v-model="form.contact.email" placeholder="Email" class="w-full p-2 border rounded" :disabled="!isAdmin" />
      </div>
    </div>

    <!-- Sosial Media -->
    <div>
      <label class="flex items-center gap-2 font-semibold">
        <input type="checkbox" v-model="form.layoutOptions.showSocials" :disabled="!isAdmin" />
        Tampilkan Sosial Media
      </label>
      <div v-if="form.layoutOptions.showSocials" class="mt-2 space-y-2">
        <div v-for="(item, i) in form.socials" :key="i" class="flex gap-2 items-center">
          <select v-model="item.icon" class="flex-1 p-2 border rounded" :disabled="!isAdmin">
            <option disabled value="">Pilih Icon</option>
            <option v-for="icon in availableIcons" :key="icon.class" :value="icon.class">{{ icon.label }}</option>
          </select>
          <input v-model="item.link" placeholder="Link" class="flex-1 p-2 border rounded" :disabled="!isAdmin" />
          <button v-if="isAdmin" @click="form.socials.splice(i, 1)" class="text-red-500">Hapus</button>
        </div>
        <button
          v-if="isAdmin"
          @click="form.socials.push({ icon: '', link: '' })"
          class="mt-2 text-sm text-blue-600"
        >
          + Tambah Sosial Media
        </button>
      </div>
    </div>

    <!-- Style -->
    <div>
      <label class="font-semibold">Gaya Tampilan</label>
      <select v-model="form.layoutOptions.style" class="w-full p-2 border rounded mt-1" :disabled="!isAdmin">
        <option value="dark">Gelap</option>
        <option value="light">Terang</option>
      </select>
    </div>

    <!-- Tombol Simpan -->
    <div class="pt-4" v-if="isAdmin">
      <button @click="submitForm" class="px-4 py-2 bg-green-600 text-white rounded">Simpan Perubahan</button>
    </div>
  </div>

  <MediaPicker :show="showMedia" @close="showMedia = false" @select="handleMediaSelect" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MediaPicker from '@/views/MediaPicker.vue'
import { API_ENDPOINTS } from '@/config/api'

const form = ref({
  logo: '',
  brand: '',
  description: '',
  navigation: [],
  contact: { address: '', phone: '', email: '' },
  socials: [],
  layoutOptions: {
    showNavigation: true,
    showContact: true,
    showSocials: true,
    style: 'dark'
  }
})

const isAdmin = ref(false)

const availableIcons = [
  { label: 'Instagram', class: 'fab fa-instagram' },
  { label: 'Facebook', class: 'fab fa-facebook' },
  { label: 'Twitter', class: 'fab fa-twitter' },
  { label: 'LinkedIn', class: 'fab fa-linkedin' },
  { label: 'YouTube', class: 'fab fa-youtube' },
]

const showMedia = ref(false)

function openMediaModal() {
  if (isAdmin.value) showMedia.value = true
}

function handleMediaSelect(url) {
  form.value.logo = url
  showMedia.value = false
}

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user?.role === 'admin'

  try {
    const res = await axios.get(API_ENDPOINTS.footerSettings)
    const data = res.data
    const keysToParse = ['navigation', 'contact', 'socials', 'layoutOptions']
    keysToParse.forEach(key => {
      if (typeof data[key] === 'string') {
        try {
          data[key] = JSON.parse(data[key])
        } catch {
          data[key] = Array.isArray(data[key]) ? [] : {}
        }
      }
    })
    form.value = data
  } catch (err) {
    console.error('Gagal load footer:', err)
  }
})

async function submitForm() {
  if (!isAdmin.value) return
  try {
    await axios.put(API_ENDPOINTS.footerSettings, form.value)
    alert('Footer berhasil disimpan!')
  } catch (err) {
    console.error(err)
    alert('Gagal menyimpan footer!')
  }
}
</script>
