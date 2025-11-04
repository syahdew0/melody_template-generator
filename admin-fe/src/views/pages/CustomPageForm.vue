<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">
      {{ route.params.id ? 'Edit' : 'Tambah' }} Section:
      <span class="capitalize">{{ section }}</span> ({{ page }})
    </h1>

    <div class="mb-4">
      <button
        @click="goBack"
        class="text-blue-600 underline hover:text-blue-800"
      >
        ← Kembali
      </button>
    </div>

    <div v-if="loading">Loading schema...</div>
    <div v-else-if="!sectionSchema">
      <p class="text-red-600">Schema tidak ditemukan.</p>
    </div>
    <div v-else>
      <div class="space-y-4">
        <div v-for="(field, key) in fields" :key="key">
          <label class="block font-semibold mb-1 capitalize">{{ key }}</label>

          <!-- Text -->
          <input
            v-if="field.type === 'text' && key !== 'image' && key !== 'icon'"
            v-model="formData[key]"
            type="text"
            class="w-full border p-2 rounded"
            :required="field.required || false"
          />

          <!-- HTML Editor -->
          <QuillEditor
            v-else-if="field.type === 'html'"
            v-model:content="formData[key]"
            content-type="html"
            class="bg-white border rounded"
            :required="field.required || false"
          />

          <!-- Image / Icon Field -->
          <div v-else-if="field.type === 'image'">
            <div class="flex items-center gap-2">
              <input
                v-model="formData[key]"
                type="text"
                placeholder="Masukkan URL gambar atau klik Pilih Media"
                class="flex-1 border p-2 rounded"
                :required="field.required || false"
              />
              <button
                type="button"
                class="bg-blue-600 text-white px-3 py-1 rounded"
                @click="openMediaPicker(key)"
              >
                Pilih
              </button>
              <button
                v-if="formData[key]"
                type="button"
                class="bg-red-500 text-white px-3 py-1 rounded"
                @click="removeImage(key)"
              >
                Hapus
              </button>
            </div>

            <div v-if="formData[key]" class="mt-2 flex items-center gap-2">
              <img
                :src="formData[key]"
                alt="Preview"
                class="w-24 h-24 object-cover border rounded"
              />
              <span class="text-xs text-gray-500 break-all">{{
                formData[key]
              }}</span>
            </div>
          </div>

          <!-- Fallback -->
          <input
            v-else
            v-model="formData[key]"
            type="text"
            class="w-full border p-2 rounded"
            :required="field.required || false"
          />
        </div>
      </div>

      <!-- Tombol Simpan -->
      <div class="mt-6 flex gap-4">
        <button
          @click="submitForm"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Simpan Perubahan
        </button>
        <button
          @click="goBack"
          class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Batal
        </button>
      </div>
    </div>

    <!-- Media Picker Global -->
    <MediaPicker
      :show="showMediaPicker"
      @close="showMediaPicker = false"
      @select="selectImage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import MediaPicker from '@/views/MediaPicker.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const page = computed(() => route.params.page)
const section = computed(() => route.params.section)
const editId = computed(() => route.params.id)
const themeId = ref(1)
const websiteId = 1
const loading = ref(true)
const sectionSchema = ref(null)
const formData = ref({})

const showMediaPicker = ref(false)
const activeImageFieldKey = ref('')

// Schema default
const fields = computed(() => {
  if (!sectionSchema.value) return {}
  const result = { ...sectionSchema.value }
  result.title = result.title || { type: 'text', required: true }
  result.content = result.content || { type: 'html', required: false }
  result.image = result.image || { type: 'image', required: false }
  result.icon = result.icon || { type: 'image', required: false }
  result.link = result.link || { type: 'text', required: false }
  delete result.label
  return result
})

const goBack = () => router.back()

// Ambil schema
const fetchSchema = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.websiteSchema(websiteId))
    const schemaRaw = res.data.schema || res.data.theme?.schema
    themeId.value = res.data.theme?.id || 1

    const parsed = typeof schemaRaw === 'string' ? JSON.parse(schemaRaw) : schemaRaw
    const allSchemas = parsed?.custom_page || {}
    sectionSchema.value = allSchemas[page.value]?.[section.value] || null
  } catch (err) {
    console.error('Gagal ambil schema:', err)
    toast.error('Gagal memuat schema tema')
  }
}

// Ambil data untuk edit
const fetchItemData = async () => {
  if (!editId.value) return
  try {
    const res = await axios.get(`${API_ENDPOINTS.customPages}/${editId.value}`)
    const item = res.data
    const parsed =
      typeof item.items === 'string' ? JSON.parse(item.items) : item.items
    formData.value = parsed || {}
  } catch (err) {
    console.warn('Gagal parse item:', err)
  }
}

// Media Picker
const openMediaPicker = (key) => {
  activeImageFieldKey.value = key
  showMediaPicker.value = true
}

const selectImage = (url) => {
  if (activeImageFieldKey.value) {
    formData.value[activeImageFieldKey.value] = url
  }
  showMediaPicker.value = false
}

// Hapus gambar/icon
const removeImage = (key) => {
  formData.value[key] = ''
  toast.info(`Field ${key} dihapus`)
}

onMounted(async () => {
  await fetchSchema()
  if (!sectionSchema.value) {
    loading.value = false
    return
  }

  if (editId.value) {
    await fetchItemData()
  } else {
    const copy = { ...sectionSchema.value }
    delete copy.label
    formData.value = {}
    for (const key in copy) {
      formData.value[key] = ''
    }
  }
  loading.value = false
})

// Simpan data
const submitForm = async () => {
  const payload = {
    title: formData.value.title || 'Untitled',
    description: '',
    tag: `${page.value}-${section.value}`,
    page: page.value,
    theme_id: themeId.value,
    image: formData.value.image || null,
    is_active: true,
    created_by: 'admin',
    items: { ...formData.value },
  }

  try {
    if (editId.value) {
      await axios.put(`${API_ENDPOINTS.customPages}/${editId.value}`, payload)
    } else {
      await axios.post(API_ENDPOINTS.customPages, payload)
    }
    toast.success('Berhasil disimpan')
    router.back()
  } catch (err) {
    console.error('Gagal menyimpan:', err)
    toast.error('Gagal menyimpan')
  }
}
</script>

<style scoped>
input {
  font-size: 14px;
}
</style>
