
<template>
    <div class="p-8">
      <h1 class="text-2xl font-bold">Dashboard Admin</h1>
      <p>Selamat datang di halaman admin!</p>
  
      <div class="text-sm text-gray-600 text-center mt-4">
        Login sebagai: <strong>{{ userRole || 'Tidak diketahui' }}</strong>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { API_ENDPOINTS } from '@/config/api'
  
  const userRole = ref('')
  
  onMounted(async () => {
  const localUser = JSON.parse(localStorage.getItem('user'))
  if (localUser?.role) {
    userRole.value = localUser.role
  } else {
    try {
      const res = await fetch(API_ENDPOINTS.auth.me, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })  
      const data = await res.json()
      userRole.value = data?.role || 'Tidak diketahui'
    } catch (err) {
      console.error('Gagal ambil data user:', err.message)
    }
  }
})

  </script>
  