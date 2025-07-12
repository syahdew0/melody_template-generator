<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Custom Pages</h1>

    <!-- <div class="mb-6">
      <label class="block mb-2 font-semibold">Filter by Page:</label>
      <select v-model="selectedPage" class="border p-2 rounded">
        <option value="">-- All Pages --</option>
        <option v-for="pageKey in pageList" :key="pageKey" :value="pageKey">{{ pageKey }}</option>
      </select>
    </div> -->

    <table class="w-full table-auto border mb-4">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-4 py-2 text-left">Page</th>
          <th class="border px-4 py-2 text-left">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pageKey in filteredPages" :key="pageKey">
          <td class="border px-4 py-2 capitalize">{{ pageKey }}</td>
          <td class="border px-4 py-2">
            <button
  @click="goToPageDetail(pageKey)"
  class="px-3 py-1 bg-blue-500 text-white rounded"
>
  View
</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- SECTION TABLE -->
    <div v-for="(sections, pageKey) in visiblePages" :key="pageKey + '-section-list'">
      <div v-for="(schema, sectionKey) in sections" :key="sectionKey" class="mb-8 bg-gray-100 p-4 rounded">
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
            <tr v-for="(item, index) in getCustomPageItems(pageKey, sectionKey)" :key="item.id">
              <td class="border px-4 py-2">{{ index + 1 }}</td>
              <td class="border px-4 py-2">{{ item.items?.title }}</td>
              <td class="border px-4 py-2">
                <div v-html="item.items?.content"></div>
              </td>
              <!-- <td class="border px-4 py-2">
              <div class="flex gap-1">
                <button class="px-2 py-1 bg-blue-600 text-white rounded" @click="editItem(item)">
                  Edit
                </button>
                <button class="px-2 py-1 bg-gray-500 text-white rounded" @click="moveItem(pageKey, sectionKey, index, 'up')" :disabled="index === 0">
                  ↑
                </button>
                <button class="px-2 py-1 bg-gray-500 text-white rounded" @click="moveItem(pageKey, sectionKey, index, 'down')" :disabled="index === getCustomPageItems(pageKey, sectionKey).length - 1">
                  ↓
                </button>
              </div>
            </td> -->
            <td class="border px-4 py-2">
            <div class="flex gap-1">
              <button class="px-2 py-1 bg-blue-600 text-white rounded" @click="editItem(item)">
                Edit
              </button>
              <button class="px-2 py-1 bg-red-600 text-white rounded" @click="deleteItem(item)">
                Hapus
              </button>
            </div>
          </td>

            </tr>
          </tbody>
        </table>

        <button class="bg-blue-500 text-white px-3 py-1 rounded" @click="addItem(pageKey, sectionKey)">
          Tambah Item
        </button>
        <!-- <button
          class="bg-red-500 text-white px-3 py-1 ml-2 rounded"
          @click="deleteItems(pageKey, sectionKey)"
        >
          Hapus 
        </button> -->

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const router = useRouter()

const customPages = ref({})
const selectedPage = ref('')
const expandedPages = ref({})
const customPageItems = ref([])

const goToPageDetail = (pageKey) => {
  router.push({ name: 'CustomPageDetail', params: { page: pageKey } })
}

const fetchSchema = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.activeTheme(1))
    customPages.value = res.data.theme?.schema?.custom_page || {}
  } catch (err) {
    console.error('Failed to fetch schema:', err)
  }
}

const fetchCustomPageItems = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.customPages)
    customPageItems.value = res.data.map(item => ({
      ...item,
      items: typeof item.items === 'string' ? JSON.parse(item.items) : item.items
    }))
  } catch (err) {
    console.error('Failed to fetch items:', err)
  }
}

const pageList = computed(() => Object.keys(customPages.value))

const filteredPages = computed(() => {
  if (!selectedPage.value) return pageList.value
  return pageList.value.filter((p) => p === selectedPage.value)
})

const visiblePages = computed(() => {
  return Object.fromEntries(
    Object.entries(customPages.value).filter(([key]) => expandedPages.value[key])
  )
})

const getCustomPageItems = (page, section) => {
  const tag = `${page}-${section}`
  return customPageItems.value.filter((item) => item.tag === tag)
}

const addItem = (page, section) => {
  router.push({
    name: 'CustomPageSection',
    params: { page, section }
  })
}

const editItem = (item) => {
  router.push({
    name: 'CustomPageSection',
    params: {
      page: item.tag.split('-')[0],
      section: item.tag.split('-')[1],
      id: item.id
    }
  })
}

const deleteItem = async (item) => {
  if (!confirm('Yakin ingin menghapus item ini?')) return
  try {
    await axios.delete(`${API_ENDPOINTS.customPages}/${item.id}`)
    await fetchCustomPageItems()
    alert('Item berhasil dihapus')
  } catch (err) {
    console.error('Gagal hapus item:', err)
    alert('Gagal menghapus item')
  }
}

onMounted(async () => {
  await fetchSchema()
  await fetchCustomPageItems()
})
</script>


<style scoped>
table th, table td {
  font-size: 14px;
}
</style>


INSERT INTO websites (id, name, user_id, subdomain)
    -> VALUES (1, 'Default Website', 1, 'default');
ERROR 1364 (HY000): Field 'created_at' doesn't have a default value
MariaDB [db_backend1]> INSERT INTO websites (id, name, user_id, subdomain, created_at, updated_at)
    -> VALUES (1, 'Default Website', 1, 'default', NOW(), NOW());