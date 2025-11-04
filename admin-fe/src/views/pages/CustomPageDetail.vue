<template>
  <div class="p-6">
    <!-- Tombol Kembali -->
    <button
      @click="goBack"
      class="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
    >
      ← Kembali
    </button>

    <h1 class="text-2xl font-bold mb-4 capitalize">{{ page }} Sections</h1>

    <div
      v-for="(schema, sectionKey) in pageSections"
      :key="sectionKey"
      class="mb-8 bg-gray-100 p-4 rounded"
    >
      <h2 class="text-lg font-semibold mb-2 capitalize">
        {{ schema.label || sectionKey }}
      </h2>

      <table class="w-full table-auto border mb-2 bg-white">
        <thead>
          <tr class="bg-gray-200">
            <th class="border px-4 py-2">No</th>
            <th class="border px-4 py-2">Title</th>
            <th class="border px-4 py-2">Content</th>
            <th class="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in getSectionItems(sectionKey)"
            :key="item.id"
          >
            <td class="border px-4 py-2">{{ index + 1 }}</td>
            <td class="border px-4 py-2">{{ item.items?.title }}</td>
            <td class="border px-4 py-2">
              <div v-html="item.items?.content"></div>
            </td>
            <td class="border px-4 py-2">
              <div class="flex gap-1">
                <button
                  class="px-2 py-1 bg-blue-600 text-white rounded"
                  @click="editItem(item, sectionKey)"
                >
                  Edit
                </button>
                <button
                  class="px-2 py-1 bg-red-600 text-white rounded"
                  @click="deleteItem(item)"
                >
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <button
        class="bg-blue-500 text-white px-3 py-1 rounded"
        @click="addItem(sectionKey)"
      >
        Tambah Item
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const page = route.params.page

const customPages = ref({})
const items = ref([])

const user = JSON.parse(localStorage.getItem('user') || '{}')
const websiteId = user?.website_id || 1

function goBack() {
  router.push('/admin/custom-pages')
}

// === Tambahan: simpan dan restore posisi scroll ===
function saveScrollPosition() {
  localStorage.setItem('customPageScroll', window.scrollY)
}

async function restoreScrollPosition() {
  const y = Number(localStorage.getItem('customPageScroll') || 0)
  await nextTick() // tunggu DOM selesai render
  window.scrollTo({ top: y, behavior: 'smooth' })
}

const fetchSchema = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.activeTheme(websiteId))
    const theme = res.data.theme
    if (theme && theme.schema) {
      const schema =
        typeof theme.schema === 'string'
          ? JSON.parse(theme.schema)
          : theme.schema
      customPages.value = schema.custom_page || {}
    }
  } catch (err) {
    console.error('Gagal ambil schema:', err)
    alert('Gagal memuat schema tema')
  }
}

const fetchItems = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.customPages)
    items.value = res.data.map((i) => ({
      ...i,
      items: typeof i.items === 'string' ? JSON.parse(i.items) : i.items
    }))
  } catch (err) {
    console.error('Gagal ambil items:', err)
    alert('Gagal memuat data')
  }
}

const getSectionItems = (sectionKey) => {
  return items.value.filter((i) => i.tag === `${page}-${sectionKey}`)
}

const pageSections = computed(() => customPages.value?.[page] || {})

const addItem = (sectionKey) => {
  saveScrollPosition()
  router.push({ name: 'CustomPageSection', params: { page, section: sectionKey } })
}

const editItem = (item, sectionKey) => {
  saveScrollPosition()
  router.push({
    name: 'CustomPageSection',
    params: { page, section: sectionKey, id: item.id }
  })
}

const deleteItem = async (item) => {
  if (!confirm('Yakin ingin menghapus item ini?')) return
  try {
    await axios.delete(`${API_ENDPOINTS.customPages}/${item.id}`)
    await fetchItems()
    toast.success('Berhasil dihapus')
  } catch (err) {
    console.error('Gagal menyimpan:', err)
    toast.error('Gagal menyimpan')
  }
}

onMounted(async () => {
  await fetchSchema()
  await fetchItems()
  await restoreScrollPosition()
})
</script>

<style scoped>
table th,
table td {
  font-size: 14px;
}
</style>
