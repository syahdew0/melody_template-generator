<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-100 to-white px-6 py-8">
    <div class="max-w-full mx-auto bg-white p-8 rounded-3xl shadow-lg">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-slate-800">Manajemen Kontak</h1>
        <div class="flex gap-4">
          <button @click="activeTab = 'settings'" :class="tabClass('settings')">Pengaturan Form</button>
          <button @click="activeTab = 'messages'" :class="tabClass('messages')">Pesan Masuk</button>
        </div>
      </div>

      <!-- Settings Tab -->
      <form v-if="activeTab === 'settings'" @submit.prevent="saveSettings" class="space-y-8">
        <p v-if="!isAdmin" class="text-red-500 text-sm">Hanya admin yang dapat mengedit pengaturan form.</p>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Judul Form</label>
          <input v-model="settings.formHeader" type="text" class="input" :disabled="!isAdmin" />
        </div>

        <!-- Label -->
        <!-- <div>
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Label Form</h2>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="(value, key) in settings.formLabels" :key="key">
              <label class="block text-sm font-medium text-slate-700 capitalize">{{ key }}</label>
              <input v-model="settings.formLabels[key]" type="text" class="input" />
            </div>
          </div>
        </div> -->

        <!-- Placeholder -->
        <!-- <div>
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Placeholder</h2>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="(value, key) in settings.formPlaceholders" :key="key">
              <label class="block text-sm font-medium text-slate-700 capitalize">{{ key }}</label>
              <input v-model="settings.formPlaceholders[key]" type="text" class="input" />
            </div>
          </div>
        </div> -->

        <!-- Subjects -->
        <div>
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Daftar Subjek</h2>
          <div v-for="(subject, index) in settings.subjects" :key="index" class="flex items-center gap-2 mb-2">
            <input v-model="settings.subjects[index]" type="text" class="input flex-1" :disabled="!isAdmin" />
            <button v-if="isAdmin" type="button" @click="removeSubject(index)" class="text-red-600 hover:underline text-sm">Hapus</button>
          </div>
          <button
            v-if="isAdmin"
            type="button"
            @click="addSubject"
            class="text-blue-600 hover:underline text-sm mt-2"
          >
            + Tambah Subjek
          </button>
        </div>

        <div class="text-right">
          <button v-if="isAdmin" type="submit" :disabled="saving" class="btn-primary">
            {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </form>

      <!-- Messages Tab -->
      <div v-else>
        <h2 class="text-xl font-semibold text-slate-800 mb-4">Pesan Masuk</h2>
        <div v-if="messages.length > 0" class="space-y-4">
          <div v-for="msg in messages" :key="msg.id" class="p-4 rounded-xl border bg-slate-50 shadow-sm">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-bold text-slate-800">{{ msg.name }} (<span class="text-blue-600">{{ msg.email }}</span>)</p>
                <p class="text-sm text-slate-600">Telepon: {{ msg.phone || '-' }}</p>
                <p class="text-sm text-slate-600">Subjek: {{ msg.subject || '-' }}</p>
              </div>
              <button v-if="isAdmin" type="button" @click="deleteMessage(msg.id)" class="text-sm text-red-600 hover:underline">Hapus</button>
            </div>
            <p class="mt-2 text-slate-700 whitespace-pre-line">{{ msg.message }}</p>
          </div>
        </div>
        <div v-else class="text-slate-500">Belum ada pesan masuk.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

// State
const activeTab = ref('settings')
const saving = ref(false)
const isAdmin = ref(false)

const settings = ref({
  formHeader: '',
  formLabels: {},
  formPlaceholders: {},
  subjects: []
})

const messages = ref([])

const tabClass = (tab) =>
  `px-4 py-2 rounded-xl text-sm font-semibold transition ${
    activeTab.value === tab ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
  }`

// Load data
const fetchSettings = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.contactSettings)
    const data = res.data

    // Parse subjects if JSON string
    if (typeof data.subjects === 'string') {
      try {
        const parsed = JSON.parse(data.subjects)
        data.subjects = Array.isArray(parsed) ? parsed : []
      } catch {
        data.subjects = []
      }
    }

    if (!Array.isArray(data.subjects)) data.subjects = []

    settings.value = data
  } catch (err) {
    console.error('Gagal memuat pengaturan:', err)
  }
}

const fetchMessages = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.contactMessages)
    messages.value = res.data || []
  } catch (err) {
    console.error('Gagal memuat pesan:', err)
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    await axios.put(API_ENDPOINTS.contactSettings, settings.value)
    alert('Pengaturan berhasil disimpan!')
  } catch (err) {
    console.error(err)
    alert('Gagal menyimpan pengaturan.')
  } finally {
    saving.value = false
  }
}

const addSubject = () => settings.value.subjects.push('')
const removeSubject = (index) => settings.value.subjects.splice(index, 1)

const deleteMessage = async (id) => {
  if (!confirm('Yakin ingin menghapus pesan ini?')) return
  try {
    await axios.delete(`${API_ENDPOINTS.contactMessages}/${id}`)
    messages.value = messages.value.filter((m) => m.id !== id)
  } catch (err) {
    console.error('Gagal menghapus pesan:', err)
  }
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user?.role === 'admin'
  fetchSettings()
  fetchMessages()
})
</script>

<style scoped>
.input {
  @apply w-full px-4 py-2 rounded-xl border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition;
}
.btn-primary {
  @apply bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed;
}
</style>
