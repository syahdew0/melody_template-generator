<template>
  <section class="p-8 bg-white rounded shadow">
    <h2 class="text-2xl font-bold mb-4">Kelola Tim</h2>

    <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
      hanya admin yang dapat <strong>mengedit</strong> dan dapat mengubah konten.
    </p>
    
    <!-- Header Section -->
    <div class="mb-6">
      <label class="block font-semibold mb-1">Judul</label>
      <input v-model="teamHeader.title" class="w-full border px-4 py-2 rounded" :disabled="!isAdmin" />

      <label class="block font-semibold mt-4 mb-1">Subjudul</label>
      <input v-model="teamHeader.subtitle" class="w-full border px-4 py-2 rounded" :disabled="!isAdmin" />

      <button v-if="isAdmin" @click="updateHeader" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Simpan Header
      </button>
    </div>

    <hr class="my-6" />

    <h3 class="text-xl font-semibold mb-4">Anggota Tim</h3>

    <div v-for="(member) in teamMembers" :key="member.id" class="mb-4 p-4 border rounded">
      <label class="block font-medium">Nama</label>
      <input v-model="member.name" class="w-full border px-3 py-2 rounded mb-2" :disabled="!isAdmin" />

      <label class="block font-medium">Posisi</label>
      <input v-model="member.role" class="w-full border px-3 py-2 rounded mb-2" :disabled="!isAdmin" />

      <label class="block font-medium">Gambar</label>
      <div class="flex items-center gap-2 mb-2">
        <input
          v-model="member.image"
          placeholder="Masukkan URL gambar atau pilih dari media"
          class="w-full border px-3 py-2 rounded"
          :disabled="!isAdmin"
        />
        <button v-if="isAdmin" @click="openMediaPicker(member.id)" class="bg-gray-200 px-3 py-1 rounded text-sm">Pilih</button>
        <img v-if="member.image" :src="member.image" class="w-12 h-12 rounded object-cover" />
      </div>

      <div v-if="isAdmin">
        <button @click="updateMember(member)" class="bg-green-500 text-white px-4 py-1 rounded mr-2">Update</button>
        <button @click="deleteMember(member.id)" class="bg-red-500 text-white px-4 py-1 rounded">Hapus</button>
      </div>
    </div>

    <!-- Tambah Anggota Baru -->
    <div class="mt-8" v-if="isAdmin">
      <h4 class="font-bold text-lg mb-2">Tambah Anggota Baru</h4>
      <input v-model="newMember.name" placeholder="Nama" class="w-full border px-3 py-2 rounded mb-2" />
      <input v-model="newMember.role" placeholder="Posisi" class="w-full border px-3 py-2 rounded mb-2" />

      <div class="mb-2 flex items-center gap-2">
        <input
          v-model="newMember.image"
          placeholder="Masukkan URL gambar atau pilih dari media"
          class="w-full border px-3 py-2 rounded"
        />
        <button @click="openMediaPicker('new')" class="bg-gray-200 px-3 py-1 rounded text-sm">Pilih</button>
        <img v-if="newMember.image" :src="newMember.image" class="w-12 h-12 rounded object-cover" />
      </div>

      <button @click="addMember" class="bg-blue-500 text-white px-4 py-2 rounded">Tambah</button>
    </div>

    <!-- Media Picker Modal -->
    <MediaPicker :show="showMediaPicker" @select="handleMediaSelect" @close="showMediaPicker = false" />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'
import MediaPicker from '@/components/MediaPicker.vue'

const teamHeader = ref({ title: '', subtitle: '' })
const teamMembers = ref([])
const newMember = ref({ name: '', role: '', image: '' })
const isAdmin = ref(false)

const showMediaPicker = ref(false)
const selectedTarget = ref(null)

const openMediaPicker = (targetId) => {
  selectedTarget.value = targetId
  showMediaPicker.value = true
}

const handleMediaSelect = (url) => {
  if (selectedTarget.value === 'new') {
    newMember.value.image = url
  } else {
    const member = teamMembers.value.find(m => m.id === selectedTarget.value)
    if (member) member.image = url
  }
  showMediaPicker.value = false
}

const fetchTeam = async () => {
  try {
    const headerRes = await axios.get(API_ENDPOINTS.teamHeader)
    const membersRes = await axios.get(API_ENDPOINTS.teamMembers)
    teamHeader.value = headerRes.data
    teamMembers.value = membersRes.data
  } catch (error) {
    console.error('Gagal mengambil data team:', error)
    alert('Gagal mengambil data team')
  }
}

const updateHeader = async () => {
  try {
    await axios.put(API_ENDPOINTS.teamHeader, teamHeader.value)
    alert('Header diperbarui!')
  } catch (error) {
    console.error('Gagal memperbarui header:', error)
    alert('Gagal memperbarui header')
  }
}

const updateMember = async (member) => {
  try {
    await axios.put(API_ENDPOINTS.teamMemberDetail(member.id), {
      name: member.name,
      role: member.role,
      image: member.image
    })
    alert('Anggota diperbarui!')
  } catch (error) {
    console.error('Gagal memperbarui anggota:', error)
    alert('Gagal memperbarui anggota')
  }
}

const deleteMember = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus anggota ini?')) return

  try {
    await axios.delete(API_ENDPOINTS.teamMemberDetail(id))
    teamMembers.value = teamMembers.value.filter(m => m.id !== id)
    alert('Anggota dihapus!')
  } catch (error) {
    console.error('Gagal menghapus anggota:', error)
    alert('Gagal menghapus anggota')
  }
}

const addMember = async () => {
  if (!newMember.value.name || !newMember.value.role || !newMember.value.image) {
    alert('Harap isi semua field anggota baru!')
    return
  }

  try {
    const { data } = await axios.post(API_ENDPOINTS.teamMembers, newMember.value)
    teamMembers.value.push(data)
    newMember.value = { name: '', role: '', image: '' }
    alert('Anggota ditambahkan!')
  } catch (error) {
    console.error('Gagal menambahkan anggota:', error)
    alert('Gagal menambahkan anggota')
  }
}

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  isAdmin.value = user?.role === 'admin'
  await fetchTeam()
})
</script>
