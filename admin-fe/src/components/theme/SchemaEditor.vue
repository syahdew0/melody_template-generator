<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Schema Editor</h1>
    <p v-if="activeThemeName" class="text-sm text-gray-500 mb-4">
      Theme aktif: <strong>{{ activeThemeName }}</strong>
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Sidebar -->
      <div class="bg-gray-50 p-4 rounded">
        <h2 class="text-lg font-semibold mb-2">Add New Page</h2>
        <input v-model="newPageName" type="text" class="w-full mb-2 p-2 border rounded" placeholder="Page name" />
        <button @click="addPage" class="bg-blue-600 text-white px-3 py-2 rounded w-full">Add Page</button>

        <hr class="my-4" />

        <h2 class="text-lg font-semibold mb-2">Pages</h2>
        <ul>
          <li
            v-for="page in pages"
            :key="page.name"
            class="flex justify-between items-center px-3 py-2 rounded mb-1 hover:bg-gray-100"
            :class="{ 'bg-blue-100 font-bold': selectedPage === page.name }"
          >
            <span @click="selectPage(page.name)" class="cursor-pointer flex-1">
              {{ page.name }}
            </span>
            <button
              @click.stop="deletePage(page.name)"
              class="text-red-500 text-xs ml-2 hover:underline"
              title="Delete page"
            >
              ✕
            </button>
          </li>
        </ul>
      </div>

      <!-- Main Editor -->
      <div class="md:col-span-2">
        <div v-if="selectedPage">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Editing: {{ selectedPage }}</h2>
            <div class="flex gap-2 mb-4">
              <input v-model="newTagName" placeholder="Nama tag (misal: hero, badge)" class="w-full p-2 border rounded" />
              <button @click="addTag" class="bg-green-600 text-white px-3 py-1 rounded whitespace-nowrap">Add Tag</button>
              <button @click="saveSchema" class="bg-indigo-600 text-white px-3 py-1 rounded whitespace-nowrap">Save Schema</button>
            </div>
          </div>
          <div class="mb-4 p-3 bg-gray-50 border rounded flex flex-wrap gap-2 items-center">
            <button @click="selectAllTagsOnPage" class="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm">
              Centang Semua Tag
            </button>
            <button @click="clearSelectedTagsOnPage" class="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm">
              Hapus Centang
            </button>
            <button
              @click="exportSelectedTags"
              :disabled="exporting || selectedTagCount === 0"
              class="bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              {{ exporting ? 'Exporting...' : `Export Tag Terpilih (${selectedTagCount})` }}
            </button>
          </div>

          <div
            v-for="(tag, tagName) in getTagsForSelectedPage"
            :key="tagName"
            class="bg-white p-4 rounded shadow mb-4"
          >
            <div class="flex justify-between mb-2 items-center cursor-pointer" @click="toggleTag(tagName)">
              <h3 class="text-lg font-semibold">
                <span class="mr-2">
                  <span v-if="collapsedTags[tagName]">▶</span>
                  <span v-else>▼</span>
                </span>
                {{ tagName }}
              </h3>
              <div class="flex items-center gap-3">
                <label class="text-sm text-gray-700 flex items-center gap-1" @click.stop>
                  <input
                    type="checkbox"
                    :checked="isTagSelected(tagName)"
                    @change="toggleTagSelection(tagName, $event.target.checked)"
                  />
                  Export
                </label>
                <button @click.stop="deleteTag(tagName)" class="text-red-600 text-sm">Delete</button>
              </div>
            </div>

            <div v-show="!collapsedTags[tagName]" class="text-sm space-y-2">
              <div
                v-for="(field, fieldName) in tag"
                :key="fieldName"
                class="space-y-1 border p-3 rounded mb-3"
              >
                <div class="flex justify-between items-center">
                  <label class="font-mono text-gray-800">
                    {{ fieldName }}
                    <span class="text-gray-500 text-xs">
                      ({{ field.type }}{{ field.required ? ', required' : '' }})
                    </span>
                  </label>

                  <!-- Dropdown hanya untuk 'content' -->
                  <select
                    v-if="fieldName === 'content'"
                    v-model="state.custom_page[selectedPage][tagName][fieldName].type"
                    class="text-sm border rounded px-2 py-1 bg-white"
                  >
                    <option value="text">Text</option>
                    <option value="html">HTML</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-gray-500">Select a page to edit or create a new one.</div>

        <!-- Preview Semua Schema -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold mb-2">Preview Semua Schema</h3>
          <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-[400px] whitespace-pre-wrap">
            {{ JSON.stringify({ custom_page: state.custom_page }, null, 3) }}
          </pre>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import API_ENDPOINTS from '@/config/api'
import { useToast } from 'vue-toastification'


const toast = useToast()
const state = reactive({
  custom_page: {}
})

const websiteId = ref(1)
const newPageName = ref('')
const newTagName = ref('static')
const selectedPage = ref(null)
const activeThemeName = ref('')
const collapsedTags = reactive({})
const selectedTagsByPage = reactive({})
const themeId = ref(null)
const exporting = ref(false)

const pages = computed(() => Object.keys(state.custom_page).map(name => ({ name })))
const getTagsForSelectedPage = computed(() => {
  if (!selectedPage.value) return {}
  return state.custom_page[selectedPage.value] || {}
})
const selectedTagCount = computed(() => {
  if (!selectedPage.value) return 0
  return (selectedTagsByPage[selectedPage.value] || []).length
})



function addPage() {
  if (!newPageName.value) return
  if (!state.custom_page[newPageName.value]) {
    state.custom_page[newPageName.value] = {}
  }
  selectedPage.value = newPageName.value
  newPageName.value = ''
}

function selectPage(name) {
  selectedPage.value = name
  if (!selectedTagsByPage[name]) {
    selectedTagsByPage[name] = []
  }
}

function addTag() {
  if (!selectedPage.value || !newTagName.value) return

  let tagName = newTagName.value.trim()
  let count = 1

  while (state.custom_page[selectedPage.value][tagName]) {
    tagName = `${newTagName.value.trim()}_${count++}`
  }

  // Default field: hanya content dengan dropdown tipe
  state.custom_page[selectedPage.value][tagName] = {
    content: {
      type: 'text',
      required: true
    }
  }

  newTagName.value = ''
}

function isTagSelected(tagName) {
  if (!selectedPage.value) return false
  return (selectedTagsByPage[selectedPage.value] || []).includes(tagName)
}

function toggleTagSelection(tagName, checked) {
  if (!selectedPage.value) return
  const current = selectedTagsByPage[selectedPage.value] || []
  if (checked) {
    if (!current.includes(tagName)) {
      selectedTagsByPage[selectedPage.value] = [...current, tagName]
    }
    return
  }
  selectedTagsByPage[selectedPage.value] = current.filter(t => t !== tagName)
}

function selectAllTagsOnPage() {
  if (!selectedPage.value) return
  selectedTagsByPage[selectedPage.value] = Object.keys(getTagsForSelectedPage.value)
}

function clearSelectedTagsOnPage() {
  if (!selectedPage.value) return
  selectedTagsByPage[selectedPage.value] = []
}

async function exportSelectedTags() {
  if (!selectedPage.value) return
  const tagKeys = selectedTagsByPage[selectedPage.value] || []
  if (tagKeys.length === 0) {
    toast.warning('Pilih minimal 1 tag untuk export.')
    return
  }

  exporting.value = true
  try {
    const fullTags = tagKeys.map(tag => `${selectedPage.value}-${tag}`)
    const url = API_ENDPOINTS.customPagesExport(selectedPage.value, themeId.value, fullTags)
    const res = await axios.get(url)

    if (!res.data?.success) {
      toast.error(res.data?.message || 'Export gagal')
      return
    }

    const jsonStr = JSON.stringify(res.data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `custom-pages-${selectedPage.value}-selected-tags.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)

    toast.success(`Export berhasil: ${res.data.meta?.count || 0} item`)
  } catch (err) {
    console.error('Gagal export tag terpilih:', err)
    toast.error('Gagal export tag terpilih.')
  } finally {
    exporting.value = false
  }
}


async function deleteTag(tagName) {
  if (!selectedPage.value) return

  const fullTag = `${selectedPage.value}-${tagName}`

  if (!confirm(`Yakin ingin menghapus tag "${fullTag}"?`)) return

  try {
    // 1. Hapus dari state
    delete state.custom_page[selectedPage.value][tagName]
    delete collapsedTags[tagName]
    selectedTagsByPage[selectedPage.value] = (selectedTagsByPage[selectedPage.value] || []).filter(t => t !== tagName)

    // 2. Simpan ulang schema ke theme
    const res = await axios.get(API_ENDPOINTS.activeTheme(websiteId.value))
    const themeId = res.data.theme.id

    await axios.put(API_ENDPOINTS.updateTheme(themeId), {
      schema: { custom_page: state.custom_page }
    })

    toast.success(`Tag "${fullTag}" berhasil dihapus.`)
  } catch (err) {
    toast.error(`Gagal menghapus tag "${fullTag}".`)
    console.error(err)
  }
}

async function deletePage(pageName) {
  if (!confirm(`Yakin ingin menghapus halaman "${pageName}" beserta semua tag-nya?`)) return;

  try {
    // Ambil semua tag dari halaman 
    const tags = Object.keys(state.custom_page[pageName] || {})

    // Kirim request delete untuk tiap tag
    for (const tag of tags) {
      const fullTag = `${pageName}-${tag}`
      await axios.delete(API_ENDPOINTS.deleteByTag(fullTag))
    }

    // Hapus dari state
    delete state.custom_page[pageName]
    if (selectedPage.value === pageName) {
      selectedPage.value = null
    }
    delete selectedTagsByPage[pageName]

    toast.success(`Halaman "${pageName}" dan semua tag-nya berhasil dihapus.`)
  } catch (err) {
    console.error(err)
    toast.error('Gagal menghapus halaman dan tag-tag terkait.')
  }
}

function toggleTag(tagName) {
  collapsedTags[tagName] = !collapsedTags[tagName]
}

async function saveSchema() {
  try {
    const schemaToSend = {
      custom_page: { ...state.custom_page }
    }
    const res = await axios.get(API_ENDPOINTS.activeTheme(websiteId.value))
    const themeId = res.data.theme.id

    await axios.put(API_ENDPOINTS.updateTheme(themeId), {
      schema: schemaToSend
    })

    toast.success('Schema berhasil disimpan.')
  } catch (err) {
    console.error(err)
    toast.error('Gagal menyimpan schema.')
  }
}

async function loadSchema() {
  try {
    const res = await axios.get(API_ENDPOINTS.activeTheme(websiteId.value))
    if (res.data.theme && res.data.theme.schema?.custom_page) {
      state.custom_page = res.data.theme.schema.custom_page
      activeThemeName.value = res.data.theme.name
      themeId.value = res.data.theme.id || null

      for (const pageName in state.custom_page) {
        const tags = state.custom_page[pageName]
        if (!selectedTagsByPage[pageName]) {
          selectedTagsByPage[pageName] = []
        }
        for (const tagName in tags) {
          collapsedTags[tagName] = true
        }
      }
    }
  } catch (err) {
    console.warn('Gagal memuat schema:', err)
  }
}

onMounted(() => {
  loadSchema()
})

watch(getTagsForSelectedPage, (tags) => {
  if (!selectedPage.value) return
  const validTagNames = Object.keys(tags || {})
  const current = selectedTagsByPage[selectedPage.value] || []
  selectedTagsByPage[selectedPage.value] = current.filter(t => validTagNames.includes(t))
}, { deep: true })
</script>
