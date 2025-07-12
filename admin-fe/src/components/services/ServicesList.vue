<template>
  <div class="max-w-full mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold mb-6">Kelola Section Layanan</h1>

    <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      hanya admin yang dapat <strong>mengedit</strong> dan dapat mengubah konten.
    </p>

    <div class="grid gap-4 mb-6">
      <input v-model="form.title1" type="text" placeholder="Title 1" class="input" :disabled="!isAdmin" />
      <input v-model="form.title2" type="text" placeholder="Title 2" class="input" :disabled="!isAdmin"/>
      <textarea v-model="form.description" placeholder="Deskripsi" class="input h-24" :disabled="!isAdmin"></textarea>
      <input v-model="form.ctaNote" type="text" placeholder="CTA Note" class="input" :disabled="!isAdmin" />
    </div>

    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Daftar Layanan</h2>
      <div
        v-for="(service, index) in form.services"
        :key="index"
        class="border p-4 rounded-lg mb-4 bg-white shadow-sm relative"
      >
        <div class="grid gap-2 mb-2">
          <input v-model="service.title" type="text" placeholder="Judul Layanan" class="input" />
          <textarea v-model="service.desc" placeholder="Deskripsi Layanan" class="input h-20"></textarea>
          <select v-model="service.icon" class="input">
            <option disabled value="">Pilih Icon</option>
            <option v-for="icon in availableIcons" :key="icon" :value="icon">
              {{ icon }}
            </option>
          </select>
        </div>
        <button @click="removeService(index)" class="text-red-500 absolute top-2 right-2" v-if="isAdmin">Hapus</button>
      </div>

      <button @click="addService" class="btn-primary" v-if="isAdmin">+ Tambah Layanan</button>
    </div>

    <button @click="save" class="btn-success " v-if="isAdmin">💾 Simpan Perubahan</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'


const isAdmin = ref(false)
const form = ref({
  title1: '',
  title2: '',
  description: '',
  ctaNote: '',
  services: []
})

const availableIcons = [
  'LampIcon',
  'StarIcon',
  'ShieldIcon',
  'RocketIcon',
  'HeartIcon',
  'ClockIcon',
  'BookIcon',
  'CheckIcon',
  'SmileIcon',
  'GearIcon'
]

const fetchData = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.serviceList)
    const result = res.data || {}

    if (typeof result.services === 'string') {
      try {
        result.services = JSON.parse(result.services)
      } catch (e) {
        console.error('Gagal parse services:', e)
        result.services = []
      }
    }

    if (!Array.isArray(result.services)) {
      result.services = []
    }

    form.value = result
  } catch (err) {
    console.error('Gagal mengambil data:', err)
  }
}

const addService = () => {
  if (!isAdmin.value) return
  const last = form.value.services.at(-1)
  if (last && (!last.title && !last.desc && !last.icon)) {
    alert('Harap isi layanan sebelumnya dulu sebelum menambah baru.')
    return
  }
  form.value.services.push({ title: '', desc: '', icon: '' })
}

const removeService = (index) => {
  form.value.services.splice(index, 1)
}

const save = async () => {
  if (!isAdmin.value) return
  try {
    const cleanedServices = form.value.services.filter(service =>
      service.title.trim() || service.desc.trim() || service.icon.trim()
    )

    await axios.put(API_ENDPOINTS.adminServiceList, {
      ...form.value,
      services: cleanedServices
    })

    alert('Berhasil disimpan!')
  } catch (err) {
    console.error('Gagal menyimpan:', err)
    alert('Gagal menyimpan!')
  }
}

// onMounted(fetchData)
//    const user = JSON.parse(localStorage.getItem('user') || '{}')
//   isAdmin.value = user?.role === 'admin'
onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user?.role === 'admin'
  fetchData()
})

</script>

<style scoped>
.input {
  @apply border border-gray-300 rounded px-4 py-2 w-full;
}
.btn-primary {
  @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600;
}
.btn-success {
  @apply bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600;
}
</style>
