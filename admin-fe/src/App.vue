<template>
  <div>
    <div v-if="!isLoginPage" class="flex min-h-screen relative">
      <SidebarPage :isOpen="sidebarOpen" @closeSidebar="sidebarOpen = false" class="z-50" />
      <div class="flex-1 transition-all duration-300 min-h-screen" :class="{ 'ml-0': isMobile, 'ml-52': !isMobile && sidebarOpen }">
        <NavbarPage @toggleSidebar="sidebarOpen = !sidebarOpen" />
        <router-view />
      </div>
    </div>
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import SidebarPage from './components/SidebarPage.vue'
import NavbarPage from './components/NavbarPage.vue'
import { onMounted, onBeforeUnmount, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import store from './store'

const router = useRouter()
const route = useRoute()

const sidebarOpen = ref(false)
const isMobile = ref(false)
const isLoginPage = computed(() => route.name === 'LoginPage')

let checkInterval = null

// Auto logout saat token tidak valid atau kadaluarsa
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// Setup Interceptor: inject token dan refresh otomatis
function setupAxiosInterceptors() {
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }, (error) => Promise.reject(error))

  axios.interceptors.response.use((response) => {
    const newToken = response.headers['x-refreshed-token']
    if (newToken) {
      localStorage.setItem('token', newToken)
      console.log('[Axios] Token diperbarui otomatis.')
    }
    return response
  }, (error) => {
    if (error.response?.status === 401) {
      console.warn('[Axios] Token tidak valid. Logout...')
      logout()
    }
    return Promise.reject(error)
  })
}

//  Cek token expired setiap 5 detik
function startTokenCheckLoop() {
  checkInterval = setInterval(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp < now) {
        console.warn('[Token] Sudah expired. Auto logout...')
        logout()
      }
    } catch (e) {
      console.error('[Token] Tidak valid:', e)
      logout()
    }
  }, 5000)
}

//  Cek lebar layar untuk sidebar
function checkMobile() {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) sidebarOpen.value = false
}
function patchGlobalFetch() {
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    const token = localStorage.getItem('token')
    const [resource, config = {}] = args

    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    }

    const response = await originalFetch(resource, config)

    const newToken = response.headers.get('x-refreshed-token')
    if (newToken) {
      localStorage.setItem('token', newToken)
      console.log('[Fetch] Token diperbarui otomatis.')
    }

    if (response.status === 401) {
      console.warn('[Fetch] Token expired. Auto logout...')
      logout()
    }

    return response
  }
}


onMounted(() => {
  
  const init = async () => {
    setupAxiosInterceptors()
    patchGlobalFetch()
    startTokenCheckLoop()
    checkMobile()
    await store.dispatch('fetchWebsiteIdFromServer')
    window.addEventListener('resize', checkMobile)
  }

  init() // panggil async function
})


onBeforeUnmount(() => {
  if (checkInterval) clearInterval(checkInterval)
  window.removeEventListener('resize', checkMobile)
})
</script>

<style>
/* Tambahkan styling tambahan jika perlu */
</style>
