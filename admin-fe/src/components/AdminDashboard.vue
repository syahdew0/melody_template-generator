<template>
  <div class="p-8 font-poppins">
    <h1 class="text-2xl font-bold mb-2">Dashboard Admin</h1>
    <p class="text-gray-700">Selamat datang di halaman admin!</p>

    <div class="text-sm text-gray-600 mt-4">
      Login sebagai: <strong>{{ userRole || 'Tidak diketahui' }}</strong>
    </div>
   
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-8">
      <div
        v-for="shortcut in shortcuts"
        :key="shortcut.title"
        class="p-6 bg-white shadow-md rounded-2xl hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-blue-500"
        @click="goTo(shortcut.route)"
      >
        <div class="flex items-center space-x-4">
          <div class="text-blue-600 text-3xl">
            <component :is="shortcut.icon" />
          </div>
          <div>
            <h2 class="text-lg font-semibold">{{ shortcut.title }}</h2>
            <p class="text-gray-500 text-sm">{{ shortcut.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Panels: Testimoni & Users -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
      <!-- Panel Testimoni -->
      <div class="border rounded-lg shadow-md flex flex-col">
        <div class="bg-gray-100 px-4 py-2 flex items-center justify-between border-b">
          <div class="flex items-center gap-2">
            <MessageCircle class="w-5 h-5" />
            <span class="font-semibold">Testimoni</span>
          </div>
          <button @click="fetchTestimoni" class="hover:text-blue-600">🔄</button>
        </div>
        <div class="p-4 flex-1 overflow-auto min-h-[200px] max-h-[400px]">
          <div v-if="loadingTestimoni" class="text-gray-400">Memuat testimoni...</div>
          <div v-else-if="testimoni.length === 0" class="text-gray-400">Belum ada testimoni.</div>
          <div v-else>
            <div v-for="(item, index) in testimoni" :key="index" class="mb-4">
              <p class="text-gray-700 italic">"{{ item.content }}"</p>
              <p class="text-sm text-gray-500 mt-1">- {{ item.author }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel Users -->
      <div class="border rounded-lg shadow-md flex flex-col">
        <div class="bg-gray-100 px-4 py-2 flex items-center justify-between border-b">
          <div class="flex items-center gap-2">
            <Users class="w-5 h-5" />
            <span class="font-semibold">Users</span>
          </div>
          <button @click="fetchUsers" class="hover:text-blue-600">🔄</button>
        </div>
        <div class="p-4 flex-1 overflow-auto min-h-[200px] max-h-[400px]">
          <div v-if="loadingUsers" class="text-gray-400">Memuat data pengguna...</div>
          <div v-else>
            <div
              v-for="(user, index) in users"
              :key="index"
              class="flex items-center justify-between py-2 border-b last:border-b-0"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center">
                  <User class="w-5 h-5" />
                </div>
                <div>
                  <div class="font-medium text-black">{{ user.name }}</div>
                  <div class="text-sm text-blue-600">{{ user.email }}</div>
                </div>
              </div>
              <button class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_ENDPOINTS } from '@/config/api'
import {
  FileText,
  Settings,
  Image,
  LayoutDashboard,
  Users,
  MessageCircle,
  User
} from 'lucide-vue-next'

const router = useRouter()
const userRole = ref('')

const testimoni = ref([])
const users = ref([])
const loadingTestimoni = ref(false)
const loadingUsers = ref(false)

const shortcuts = [
  {
    title: 'Post',
    description: 'Edit halaman dan komponen',
    route: '/admin/posts',
    icon: LayoutDashboard
  },
  {
    title: 'Pengaturan Website',
    description: 'Atur preferensi dan konfigurasi',
    route: '/admin/settings',
    icon: Settings
  },
  {
    title: 'Galeri & Media',
    description: 'Upload dan kelola gambar',
    route: '/MediaManager',
    icon: Image
  },
  {
    title: 'Pages',
    description: 'Lihat pages',
    route: '/admin/pages',
    icon: FileText
  },
]

const goTo = (route) => {
  router.push(route)
}

const fetchTestimoni = async () => {
  loadingTestimoni.value = true
  try {
   const res = await fetch(`${API_ENDPOINTS.testimonials}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await res.json()
    testimoni.value = data || []
  } catch (err) {
    console.error('Gagal ambil testimoni:', err)
  } finally {
    loadingTestimoni.value = false
  }
}

const fetchUsers = async () => {
  loadingUsers.value = true
  try {
    const res = await fetch(`${API_ENDPOINTS.users}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await res.json()
    users.value = data || []
  } catch (err) {
    console.error('Gagal ambil user:', err)
  } finally {
    loadingUsers.value = false
  }
}

onMounted(() => {
  const localUser = JSON.parse(localStorage.getItem('user'))
  if (localUser?.role) {
    userRole.value = localUser.role
  } else {
    try {
      fetch(API_ENDPOINTS.auth.me, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then((res) => res.json())
        .then((data) => {
          userRole.value = data?.role || 'Tidak diketahui'
        })
    } catch (err) {
      console.error('Gagal ambil data user:', err.message)
    }
  }

  fetchTestimoni()
  fetchUsers()
})
</script>
