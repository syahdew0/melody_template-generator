<template>
    <div class="max-w-full mx-auto p-6">
      <h2 class="text-2xl font-bold mb-6">Profil Saya</h2>
  
      <form @submit.prevent="updateProfile" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Basic Info -->
        <div class="col-span-2">
          <label class="block text-sm font-medium mb-1">Nama Lengkap</label>
          <input type="text" v-model="form.name" class="input-style" required />
        </div>
  
        <div>
          <label class="block text-sm font-medium mb-1">Username</label>
          <input type="text" v-model="form.username" class="input-style" required />
        </div>
  
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input type="email" v-model="form.email" class="input-style" required />
        </div>
  
        <!-- Informasi Tambahan -->
        <div>
          <label class="block text-sm font-medium mb-1">No. Telepon</label>
          <input type="text" v-model="form.phone" class="input-style" />
        </div>
  
        <div>
          <label class="block text-sm font-medium mb-1">Kota</label>
          <input type="text" v-model="form.city" class="input-style" />
        </div>
  
        <div class="col-span-2">
          <label class="block text-sm font-medium mb-1">Alamat</label>
          <textarea v-model="form.address" class="input-style"></textarea>
        </div>
  
        <div>
          <label class="block text-sm font-medium mb-1">Jenis Kelamin</label>
          <select v-model="form.gender" class="input-style">
            <option value="">-- Pilih --</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>
  
        <div>
          <label class="block text-sm font-medium mb-1">Tanggal Lahir</label>
          <input type="date" v-model="form.date_of_birth" class="input-style" />
        </div>
  
        <!-- Simpan -->
        <div class="col-span-2 text-right">
          <button type="submit" class="btn-primary">Simpan Perubahan</button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { API_ENDPOINTS } from '@/config/api'
  
  const form = ref({
    name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    gender: '',
    date_of_birth: ''
  })
  
  const fetchProfile = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.user.profile, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})
      const data = await res.json()
      if (res.ok) {
        const { name, username, email, information } = data
        form.value = {
          name,
          username,
          email,
          phone: information?.phone || '',
          address: information?.address || '',
          city: information?.city || '',
          gender: information?.gender || '',
          date_of_birth: information?.date_of_birth || ''
        }
      } else {
        alert(data.message || 'Gagal mengambil data profil')
      }
    } catch (err) {
      alert(err.message)
    }
  }
  
  const updateProfile = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.user.profile, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form.value)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      alert('Profil berhasil diperbarui')
    } catch (err) {
      alert('Gagal update profil: ' + err.message)
    }
  }
  
  onMounted(fetchProfile)
  </script>
  
  <style scoped>
  .input-style {
    @apply w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400;
  }
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700;
  }
  </style>
  