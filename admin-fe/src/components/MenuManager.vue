<template>
  <div class="text-black p-4">
    <!-- Header -->
    <div class="flex justify-between mb-4 items-center">
      <h2 class="text-lg font-bold">Navigation</h2>
      <button
        v-if="isAdmin"
        @click="openForm(null)"
        class="bg-blue-500 px-2 py-1 rounded text-sm"
      >
        + Add
      </button>
    </div>

   <!-- Upload Logo -->
<div class="col-span-full mb-6">
  <label class="block text-sm font-medium mb-1">Logo</label>
  <div class="flex items-center gap-2 mb-2">
    <input
      v-model="form.image"
      placeholder="Pilih atau tempel URL gambar"
      class="input w-full"
      :readonly="!isAdmin"
    />
    <button
      type="button"
      @click="showPicker = true"
      class="btn bg-gray-300 text-black hover:bg-gray-400"
      v-if="isAdmin"
    >
      Pilih
    </button>
  </div>
  <div v-if="form.image">
    <img :src="form.image" class="w-32 h-20 object-cover border rounded mb-2" />
    <button
      v-if="isAdmin"
      @click="saveLogo"
      class="bg-blue-600 text-white text-sm px-3 py-1 rounded"
    >
      Save Logo
    </button>
  </div>
</div>

    <!-- Daftar Menu -->
    <div v-for="menu in menus" :key="menu.id" class="mb-2">
      <!-- Menu dengan anak -->
      <div v-if="menu.children && menu.children.length">
        <div @click="toggleDropdown(menu.id)" class="flex justify-between items-center px-4 py-2 bg-white rounded cursor-pointer">
          <span>{{ menu.name }}</span>
          <svg :class="{ 'rotate-180': dropdownOpen === menu.id }" class="h-4 w-4 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <transition name="fade">
          <div v-show="dropdownOpen === menu.id" class="ml-4 mt-1 space-y-1">
            <div v-for="child in menu.children" :key="child.id" class="flex justify-between items-center">
              <router-link :to="child.path" class="block px-4 py-2 rounded hover:bg-slate-700/50 text-sm flex-1">
                {{ child.name }}
              </router-link>
              <template v-if="isAdmin">
                <button @click.stop="openForm(child)" class="text-xs text-yellow-300">Edit</button>
                <button @click.stop="deleteMenu(child.id)" class="text-xs text-red-400 ml-1">Del</button>
              </template>
            </div>
          </div>
        </transition>
      </div>

      <!-- Menu tanpa anak -->
      <div v-else class="flex justify-between items-center px-4 py-2 bg-white rounded">
        <router-link :to="menu.path || '#'" class="flex-1">
          {{ menu.name }}
        </router-link>
        <template v-if="isAdmin">
          <button @click="openForm(menu)" class="text-xs text-yellow-300">Edit</button>
          <button @click="deleteMenu(menu.id)" class="text-xs text-red-400 ml-1">Del</button>
        </template>
      </div>
    </div>

    <!-- Modal Form Menu -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white text-black p-4 rounded w-96">
        <h3 class="text-lg font-bold mb-2">{{ form.id ? 'Edit Menu' : 'Add Menu' }}</h3>
        <form @submit.prevent="submitForm">
          <input v-model="form.name" placeholder="Name" class="w-full border p-2 mb-2" required />
          <div class="mb-2">
            <label class="block text-sm font-medium mb-1">Path</label>
            <input
              v-model="form.path"
              type="text"
              class="w-full border p-2 mb-1"
              placeholder="Masukkan path manual atau pilih di bawah"
              required
            />
            <select @change="form.path = $event.target.value" class="w-full border p-2">
              <option disabled value="">Atau pilih path cepat</option>
              <option v-for="route in availablePaths" :key="route.value" :value="route.value">
                {{ route.name }} ({{ route.value }})
              </option>
            </select>
          </div>
          <select v-model="form.parent_id" class="w-full border p-2 mb-2">
            <option :value="null">Main Menu</option>
            <option v-for="m in menus" :value="m.id" :key="m.id">{{ m.name }}</option>
          </select>
          <div class="flex justify-end gap-2">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">
              {{ form.id ? 'Update' : 'Create' }}
            </button>
            <button @click="closeForm" type="button" class="text-red-500">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Media Picker Modal -->
    <MediaPicker :show="showPicker" @close="showPicker = false" @select="selectImageFromPicker" />
  </div>
</template>

<script>
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'
import MediaPicker from '@/components/MediaPicker.vue'

export default {
  components: { MediaPicker },
  data() {
    return {
      isAdmin: false,
      menus: [],
      dropdownOpen: null,
      showForm: false,
      showPicker: false,
      form: {
        id: null,
        name: '',
        path: '',
        parent_id: null,
        image: '',
      },
      availablePaths: [
        { name: 'Home', value: '/' },
        { name: 'Tentang Kami', value: '/about' },
        { name: 'Layanan', value: '/services' },
        { name: 'Portfolio', value: '/portfolio' },
        { name: 'Kontak', value: '/contact' },
        { name: 'Blog', value: '/blog' },
      ],
    }
  },
  methods: {
    async fetchMenus() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(API_ENDPOINTS.menuList, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.menus = res.data
      } catch (err) {
        console.error('Gagal memuat menu:', err)
      }
    },
    selectImageFromPicker(mediaUrl) {
      if (!this.isAdmin || !mediaUrl) return
      this.form.image = mediaUrl
      this.showPicker = false
    },
    toggleDropdown(id) {
      this.dropdownOpen = this.dropdownOpen === id ? null : id
    },
    openForm(menu) {
      if (!this.isAdmin) return
      this.form = menu
        ? { ...menu }
        : {
            id: null,
            name: '',
            path: '',
            parent_id: null,
            image: '',
          }
      this.showForm = true
    },
    closeForm() {
      this.showForm = false
      this.form = {
        id: null,
        name: '',
        path: '',
        parent_id: null,
        image: '',
      }
    },
    async submitForm() {
      if (!this.isAdmin) return
      const token = localStorage.getItem('token')
      try {
        if (this.form.id) {
          await axios.put(API_ENDPOINTS.menuUpdate(this.form.id), this.form, {
            headers: { Authorization: `Bearer ${token}` },
          })
        } else {
          await axios.post(API_ENDPOINTS.menuCreate, this.form, {
            headers: { Authorization: `Bearer ${token}` },
          })
        }
        this.closeForm()
        await this.fetchMenus()
      } catch (err) {
        console.error('Gagal menyimpan menu:', err)
      }
    },
    async saveLogo() {
      if (!this.isAdmin || !this.form.image) return
      const token = localStorage.getItem('token')

      try {
        await axios.post(
          API_ENDPOINTS.settingLogo, 
          { key: 'logo', value: this.form.image },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        alert('Logo berhasil disimpan!')
      } catch (err) {
        console.error('Gagal menyimpan logo:', err)
        alert('Gagal menyimpan logo.')
      }
    },
    async fetchLogo() {
  try {
    const res = await axios.get(API_ENDPOINTS.settingLogo)
    if (res?.data?.value) {
      this.form.image = res.data.value
    }
  } catch (err) {
    console.error('Gagal mengambil logo:', err)
  }
},
    async deleteMenu(id) {
      if (!this.isAdmin) return
      const token = localStorage.getItem('token')
      if (confirm('Yakin ingin menghapus menu ini?')) {
        try {
          await axios.delete(API_ENDPOINTS.menuDelete(id), {
            headers: { Authorization: `Bearer ${token}` },
          })
          await this.fetchMenus()
        } catch (err) {
          console.error('Gagal menghapus menu:', err)
        }
      }
    },
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.isAdmin = user?.role === 'admin'
    this.fetchMenus()
    this.fetchLogo()

    
  },
}
</script>
