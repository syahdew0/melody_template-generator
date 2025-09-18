<template>
  <nav class="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-3 flex justify-between items-center">
    <div class="flex items-center">
      <button @click="$emit('toggleSidebar')" class="mr-2 relative z-50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
                stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="text-xl font-bold capitalize">
        {{ userRole === 'admin' ? 'Admin Panel' : userRole === 'editor' ? 'Editor Panel' : 'User Panel' }}
      </div>
    </div>

    <div class="relative" v-if="userRole" ref="dropdownRef">
      <button @click="toggleDropdown" class="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-full hover:bg-gray-600">
        <img :src="userAvatar" alt="Avatar" class="w-6 h-6 rounded-full object-cover" />
        <span class="text-sm capitalize">{{ userRole }}</span>
        <svg :class="{ 'rotate-180': dropdownOpen }" class="w-4 h-4 transition-transform duration-200"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <div v-if="dropdownOpen" class="absolute text-sm right-0 mt-3 w-56 text-gray-800 z-50 bg-white shadow rounded">
        <router-link
          v-if="userRole === 'admin'"
          to="/Admin/users"
          class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
        >
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 110-8 4 4 0 010 8zm6 4a4 4 0 10-8 0 4 4 0 008 0z">
            </path>
          </svg>
          Manajemen Pengguna
        </router-link>

        <!-- <router-link
          to="/admin/ProfileManagement"
          class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
        >
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z">
            </path>
          </svg>
          My Profile
        </router-link> -->

        <button
          @click="logout"
          class="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1">
            </path>
          </svg>
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userRole = ref('')
const userAvatar = ref('')
const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  userRole.value = ''
  userAvatar.value = ''
  router.push('/').then(() => location.reload())
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user) {
    userRole.value = user.role || ''
    userAvatar.value = user.avatar || 'https://i.pravatar.cc/100'
  }

  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
