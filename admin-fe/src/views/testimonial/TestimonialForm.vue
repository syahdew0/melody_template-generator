<template>
    <div class="max-w-7xl mx-auto space-y-6 px-6 py-12">
      <h1 class="text-3xl font-semibold text-gray-800 tracking-tight">
        {{ isEdit ? 'Edit' : 'Tambah' }} Testimoni
      </h1>
  
      <form @submit.prevent="save" class="flex flex-col lg:flex-row gap-6">
        <!-- Main Editor -->
        <div class="flex-1 space-y-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-5">
            <!-- Judul -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Judul</label>
              <input
                v-model="form.title"
                type="text"
                class="w-full border border-gray-300 rounded-md shadow-sm text-sm px-3 py-2"
                placeholder="Masukkan judul testimonial"
                required
              />
            </div>
  
            <!-- Excerpt -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea
                v-model="form.excerpt"
                rows="3"
                class="w-full border border-gray-300 rounded-md shadow-sm text-sm px-3 py-2"
                placeholder="Ringkasan singkat testimoni"
              ></textarea>
            </div>
  
            <!-- Konten -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Konten</label>
              <div class="border border-gray-300 rounded-md overflow-hidden">
                <QuillEditor
                  v-model:content="form.content"
                  contentType="html"
                  theme="snow"
                  style="min-height: 250px;"
                />
              </div>
            </div>
  
            <!-- Nama Klien -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nama Klien</label>
              <input
                v-model="form.author_name"
                type="text"
                class="w-full border border-gray-300 rounded-md shadow-sm text-sm px-3 py-2"
                placeholder="Nama pemberi testimoni"
              />
            </div>
  
            <!-- Jabatan -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Jabatan / Perusahaan</label>
              <input
                v-model="form.author_position"
                type="text"
                class="w-full border border-gray-300 rounded-md shadow-sm text-sm px-3 py-2"
                placeholder="Jabatan atau perusahaan"
              />
            </div>
  
            <!-- Foto Klien -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Foto Klien</label>
              <button
                class="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                @click.prevent="showMediaPicker = true"
              >
                Pilih Foto
              </button>
  
              <div v-if="form.image" class="mt-2">
                <img :src="form.image" class="w-24 h-24 object-cover rounded border" />
                <button
                  @click="form.image = ''"
                  class="text-xs text-red-600 hover:underline mt-1 block"
                >
                  Hapus Foto
                </button>
              </div>
  
              <!-- Modal Media Picker -->
              <MediaPickerModal
                :show="showMediaPicker"
                @close="showMediaPicker = false"
                @select="selectImage"
              />
            </div>
          </div>
        </div>
  
        <!-- Sidebar -->
        <div class="w-full lg:w-72 space-y-6">
          <!-- Status -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h2 class="text-sm font-semibold text-gray-700 mb-2">Status</h2>
            <select
              v-model="form.status"
              class="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
  
          <!-- Tombol -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex justify-between items-center">
            <button
              type="button"
              @click="router.push('/admin/testimonials')"
              class="text-sm text-gray-600 hover:text-gray-800 hover:underline"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
            >
              {{ isEdit ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import axios from 'axios'
  import { API_ENDPOINTS } from '@/config/api'
  import { QuillEditor } from '@vueup/vue-quill'
  import MediaPickerModal from '@/views/MediaPicker.vue'
  import '@vueup/vue-quill/dist/vue-quill.snow.css'
  
  const route = useRoute()
  const router = useRouter()
  const id = route.params.id
  const isEdit = !!id
  
  const form = ref({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    author_name: '',
    author_position: '',
    status: 'published',
    type: 'testimonial'
  })
  
  const showMediaPicker = ref(false)
  const selectImage = (url) => {
    form.value.image = url
    showMediaPicker.value = false
  }
  
  // Meta key mapping
  const metaKeys = ['image', 'author_name', 'author_position']
  
  const metaToForm = (meta = []) => {
    meta.forEach(({ meta_key, meta_value }) => {
      if (metaKeys.includes(meta_key)) {
        form.value[meta_key] = meta_value
      }
    })
  }
  
  const formToMeta = () => {
    return metaKeys.map((key) => ({
      meta_key: key,
      meta_value: form.value[key]
    }))
  }
  
  const loadData = async () => {
    if (!isEdit) return
    try {
      const res = await axios.get(`${API_ENDPOINTS.posts}/${id}`)
      const post = res.data
      form.value = {
        ...form.value,
        ...post
      }
      if (post.meta) {
        metaToForm(post.meta)
      }
    } catch (err) {
      console.error('Gagal memuat data:', err)
    }
  }
  const save = async () => {
  const user = JSON.parse(localStorage.getItem('user'))
  form.value.website_id = user?.website_id || 1
  form.value.user_id = user?.id || 1 

  try {
    const payload = {
      ...form.value,
      meta: formToMeta()
    }
    

    if (isEdit) {
      await axios.put(`${API_ENDPOINTS.posts}/${id}`, payload)
    } else {
      await axios.post(API_ENDPOINTS.posts, payload)
    }

    router.push('/admin/testimonials')
  } catch (err) {
    console.error('Gagal menyimpan testimoni:', err)
  }
}



  onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user?.website_id) {
    form.value.website_id = user.website_id
  }

  loadData()
})

  </script>
  