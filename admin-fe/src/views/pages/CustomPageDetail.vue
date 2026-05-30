<template>
  <div class="p-6">
    <!-- Header dengan tombol -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-3">
        <button
          @click="goBack"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
        >
          ← Kembali
        </button>
        <h1 class="text-2xl font-bold capitalize">{{ page }} Sections</h1>
      </div>

      <div class="flex items-center gap-2">
        <!-- Tombol Export di-hide sesuai request -->

        <!-- Tombol Import -->
        <button
          @click="handleImportClick"
          class="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded"
        >
          ⬆ Import
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileSelected"
        />
      </div>
    </div>

    <!-- Section List -->
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

    <!-- =============== IMPORT PREVIEW MODAL =============== -->
    <div
      v-if="showImportPreview"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
        <!-- Modal Header -->
        <div class="p-5 border-b">
          <h3 class="text-lg font-bold">📦 Preview Import</h3>
          <p class="text-sm text-gray-500 mt-1">
            File: <strong>{{ importFileName }}</strong>
          </p>
        </div>

        <!-- Modal Body -->
        <div class="p-5 overflow-y-auto flex-1">
          <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p><strong>Page:</strong> {{ importPreviewData?.meta?.page || '-' }}</p>
            <p><strong>Theme ID:</strong> {{ importPreviewData?.theme_id || importPreviewData?.meta?.theme_id || themeId || '-' }}</p>
            <p><strong>Schema pages:</strong> {{ importSchemaPageCount }}</p>
            <p><strong>Schema tags:</strong> {{ importSchemaTagCount }}</p>
            <p><strong>Jumlah item data:</strong> {{ importPreviewData?.data?.length || 0 }}</p>
            <p><strong>Exported at:</strong> {{ importPreviewData?.meta?.exported_at || '-' }}</p>
          </div>

          <p class="text-sm font-semibold mb-2">Daftar tag data yang akan di-import:</p>
          <div class="max-h-48 overflow-y-auto border rounded">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 sticky top-0">
                <tr>
                  <th class="px-3 py-1 text-left">#</th>
                  <th class="px-3 py-1 text-left">Tag</th>
                  <th class="px-3 py-1 text-left">Title</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in importPreviewData?.data || []"
                  :key="idx"
                  class="border-t"
                >
                  <td class="px-3 py-1">{{ idx + 1 }}</td>
                  <td class="px-3 py-1 font-mono text-xs">{{ item.tag }}</td>
                  <td class="px-3 py-1">{{ item.title || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            ⚠️ Schema akan <strong>merge</strong> ke theme aktif. Data dengan tag yang tidak ada di schema hasil merge akan <strong>di-skip</strong> dan muncul sebagai warning.
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-5 border-t flex justify-end gap-3">
          <button
            @click="cancelImport"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
          >
            Batal
          </button>
          <button
            @click="confirmImport"
            :disabled="importing"
            class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded disabled:opacity-50"
          >
            <span v-if="importing">⏳ Importing...</span>
            <span v-else>✅ Konfirmasi Import</span>
          </button>
        </div>
      </div>
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

// Export/Import state
const importing = ref(false)
const showImportPreview = ref(false)
const importPreviewData = ref(null)
const importFileName = ref('')
const fileInput = ref(null)
const themeId = ref(null)
const importSchemaPageCount = computed(() => {
  const cp = importPreviewData.value?.schema?.custom_page
  if (!cp || typeof cp !== 'object') return 0
  return Object.keys(cp).length
})
const importSchemaTagCount = computed(() => {
  const cp = importPreviewData.value?.schema?.custom_page
  if (!cp || typeof cp !== 'object') return 0
  return Object.values(cp).reduce((total, tags) => {
    if (!tags || typeof tags !== 'object') return total
    return total + Object.keys(tags).length
  }, 0)
})

function goBack() {
  router.push('/admin/custom-pages')
}

// === Scroll position ===
function saveScrollPosition() {
  localStorage.setItem('customPageScroll', window.scrollY)
}

async function restoreScrollPosition() {
  const y = Number(localStorage.getItem('customPageScroll') || 0)
  await nextTick()
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
      themeId.value = theme.id || null
    }
  } catch (err) {
    console.error('Gagal ambil schema:', err)
    toast.error('Gagal memuat schema tema')
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
    toast.error('Gagal memuat data')
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

// ====================== IMPORT ====================== //
const handleImportClick = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
    fileInput.value.click()
  }
}

const handleFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  importFileName.value = file.name

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result)

      // Validasi format
      const hasSchema = !!parsed.schema
      const hasData = Array.isArray(parsed.data) && parsed.data.length > 0
      if (!hasSchema && !hasData) {
        toast.error('Format file tidak valid. File harus punya "schema" dan/atau "data".')
        return
      }

      importPreviewData.value = parsed
      showImportPreview.value = true
    } catch (err) {
      toast.error('File bukan JSON yang valid.')
      console.error('Parse error:', err)
    }
  }
  reader.readAsText(file)
}

const cancelImport = () => {
  showImportPreview.value = false
  importPreviewData.value = null
  importFileName.value = ''
}

const confirmImport = async () => {
  if (!importPreviewData.value) return

  importing.value = true
  try {
    const payload = {
      ...importPreviewData.value,
      theme_id: importPreviewData.value?.theme_id || importPreviewData.value?.meta?.theme_id || themeId.value
    }
    const res = await axios.post(API_ENDPOINTS.customPagesImport, payload)

    if (res.data.success) {
      const warningCount = res.data.warnings?.length || 0
      toast.success(
        `Import berhasil! Schema tags merge: ${res.data.schema_merged_tags || 0}, data: ${res.data.created || 0} dibuat, ${res.data.updated || 0} diupdate, ${res.data.skipped || 0} di-skip.${warningCount ? ` Warning: ${warningCount}` : ''}`
      )
      showImportPreview.value = false
      importPreviewData.value = null
      importFileName.value = ''

      // Refresh data
      await fetchSchema()
      await fetchItems()
    } else {
      toast.error(res.data.message || 'Import gagal')
    }
  } catch (err) {
    console.error('Import error:', err)
    toast.error('Gagal import data: ' + (err.response?.data?.message || err.message))
  } finally {
    importing.value = false
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
