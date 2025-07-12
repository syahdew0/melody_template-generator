<template>
  <div class="p-6 bg-white rounded-xl shadow-md max-w-full mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-blue-700">Kelola CTA Section</h2>

    <form @submit.prevent="updateData" class="space-y-4">
      <!-- Badge & Titles -->
      <div>
        <label class="label">Badge</label>
        <input v-model="form.badgeText" type="text" class="input" :disabled="!isAdmin" />
      </div>
      <div>
        <label class="label">Heading 1 (Gradient)</label>
        <input v-model="form.mainTitle1" type="text" class="input" :disabled="!isAdmin" />
      </div>
      <div>
        <label class="label">Heading 2</label>
        <input v-model="form.mainTitle2" type="text" class="input" :disabled="!isAdmin" />
      </div>
      <div>
        <label class="label">Subtitle</label>
        <textarea v-model="form.subtitle" rows="3" class="input" :disabled="!isAdmin"></textarea>
      </div>

      <!-- CTA 1 (WhatsApp) -->
      <div>
        <label class="label">Label Tombol CTA 1 (WhatsApp)</label>
        <input v-model="form.cta1Label" type="text" class="input" :disabled="!isAdmin" />
      </div>
      <div>
        <label class="label">Link Tombol CTA 1 (WhatsApp URL)</label>
        <input
          v-model="form.cta1Link"
          type="url"
          class="input"
          placeholder="https://wa.me/..."
          :disabled="!isAdmin"
        />
      </div>

      <!-- CTA 2 (Router Link) -->
      <div>
        <label class="label">Label Tombol CTA 2 (Router)</label>
        <input v-model="form.cta2Label" type="text" class="input" :disabled="!isAdmin" />
      </div>
      <div>
        <label class="label">Path Tombol CTA 2 (Router Path)</label>
        <input
          v-model="form.cta2Path"
          type="text"
          class="input"
          placeholder="/portfolio"
          :disabled="!isAdmin"
        />
      </div>

      <!-- Submit -->
      <div class="pt-4" v-if="isAdmin">
        <button
          type="submit"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
        >
          Simpan Perubahan
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
  badgeText: '',
  mainTitle1: '',
  mainTitle2: '',
  subtitle: '',
  cta1Label: '',
  cta1Link: '',
  cta2Label: '',
  cta2Path: '',
})

const isAdmin = ref(false)

const fetchData = async () => {
  try {
    const { data } = await axios.get(API_ENDPOINTS.ctaAdmin)
    Object.assign(form.value, data)
  } catch (error) {
    console.error('Gagal mengambil data CTA:', error)
  }
}

const updateData = async () => {
  if (!isAdmin.value) return
  try {
    await axios.put(API_ENDPOINTS.ctaAdmin, form.value)
    alert('Berhasil diperbarui!')
  } catch (error) {
    console.error('Gagal memperbarui data CTA:', error)
    alert('Terjadi kesalahan saat menyimpan.')
  }
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user?.role === 'admin'
  fetchData()
})
</script>

<style scoped>
.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: #f9fafb;
}
.input:focus {
  outline: none;
  border-color: #f59e0b;
  background-color: #fff;
}
.label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: #4b5563;
}
</style>
