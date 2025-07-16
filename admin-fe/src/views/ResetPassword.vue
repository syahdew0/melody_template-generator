<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <form @submit.prevent="submitReset" class="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Reset Password</h2>
        <input v-model="password" type="password" placeholder="Password baru" class="input-style" required />
        <input v-model="confirmPassword" type="password" placeholder="Konfirmasi password" class="input-style" required />
        <button type="submit" class="btn-primary w-full mt-4">Reset</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { API_ENDPOINTS } from '@/config/api'
  
  const password = ref('')
  const confirmPassword = ref('')
  const route = useRoute()
  const router = useRouter()
  const token = route.params.token
  
  const submitReset = async () => {
    if (password.value !== confirmPassword.value) {
      return alert('Password tidak cocok!')
    }
  
    try {
      const res = await fetch(`${API_ENDPOINTS.auth.resetPassword}/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.value })
      })
  
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
  
      alert('Password berhasil direset.')
      router.push('/')
    } catch (err) {
      alert(err.message)
    }
  }
  </script>
  
  <style scoped>
  .input-style {
    @apply w-full px-4 py-2 border rounded mb-3;
  }
  .btn-primary {
    @apply bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700;
  }
  </style>
  