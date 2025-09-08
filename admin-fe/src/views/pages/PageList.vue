<template>
  <div class="p-6 space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Pages</h1>
      <router-link
        v-if="permissions.canAdd"
        to="/admin/pages/create"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Add New
      </router-link>
    </div>

    <!-- Search and filter-->
    <div class="flex flex-wrap gap-4 items-center">
      <input
        v-model="search"
        placeholder="Search pages..."
        class="border w-2/3 max-w-xl p-2 rounded"
      />
      <select
        v-model="statusFilter"
        class="border p-2 rounded"
      >
        <option value="">All Status</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
    </div>

    <!-- Table -->
    <table
      class="w-full border bg-white rounded shadow-sm text-sm"
      v-if="pages.length > 0 && permissions.canView"
    >
      <thead class="bg-gray-100">
        <tr>
          <th class="p-3 text-left">Title</th>
          <th class="p-3 text-center">Status</th>
          <th class="p-3 text-center">Date</th>
          <th class="p-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="page in pages"
          :key="page.id"
          class="border-t hover:bg-gray-50 transition"
        >
          <td class="p-3 font-medium">
            <router-link
              v-if="permissions.canEdit"
              :to="`/admin/pages/edit/${page.slug}`"
              class="hover:underline"
            >
              {{ page.title }}
            </router-link>
            <span v-else>{{ page.title }}</span>
          </td>
          <td class="p-3 text-center capitalize">{{ page.status }}</td>
          <td class="p-3 text-center">{{ formatDate(page.createdAt) }}</td>
          <td class="p-3 text-right space-x-2">
            <router-link
              v-if="permissions.canEdit"
              :to="`/admin/pages/edit/${page.slug}`"
              class="text-blue-600 hover:underline"
            >
              Edit
            </router-link>
            <button
              v-if="permissions.canDelete"
              @click="deletePage(page.slug)"
              class="text-red-600 hover:underline"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- No Data / No Permission -->
    <p v-else class="text-center py-6 text-gray-500">
      {{ permissions.canView ? 'No pages found.' : 'Anda tidak memiliki izin untuk melihat halaman ini.' }}
    </p>

    <!-- Pagination -->
    <div class="flex justify-between items-center pt-4" v-if="permissions.canView && pages.length > 0">
      <button
        :disabled="page === 1"
        @click="page--"
        class="px-4 py-2 border rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span>Page {{ page }}</span>
      <button
        :disabled="!hasMore"
        @click="page++"
        class="px-4 py-2 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { debounce } from 'lodash'
import { api, API_ENDPOINTS } from '@/config/api'

export default {
  data() {
    return {
      pages: [],
      page: 1,
      perPage: 10,
      search: '',
      statusFilter: '',
      slug: '',
      total: 0,
      hasMore: false,
      permissions: {
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false
      }
    }
  },
  created() {
    this.slug = this.$route.params.slug || ''
    this.debouncedFetch = debounce(this.fetchPages, 300)
    this.init()
  },
  methods: {
    async init() {
      await this.fetchPermissions()
      if (this.permissions.canView) {
        await this.fetchPages()
      } else {
        alert("Anda tidak memiliki izin untuk melihat halaman ini.")
      }
    },
    async fetchPermissions() {
      try {
        const res = await api.get(API_ENDPOINTS.userPermissions)
        const pageKey = Object.keys(res.data).find(k => k.toLowerCase() === 'page')
        this.permissions = pageKey
          ? res.data[pageKey]
          : { canView: false, canAdd: false, canEdit: false, canDelete: false }
      } catch (err) {
        console.error('Gagal ambil permissions:', err)
        this.permissions = { canView: false, canAdd: false, canEdit: false, canDelete: false }
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    async fetchPages() {
      try {
        const res = await axios.get(`${API_ENDPOINTS.posts}`, {
          params: {
            type: 'page',
            ...(this.slug ? { slug: this.slug } : {}),
            page: this.page,
            limit: this.perPage,
            search: this.search,
            status: this.statusFilter
          }
        })

        if (res.data?.data && typeof res.data.total !== 'undefined') {
          this.pages = res.data.data
          this.total = res.data.total
          this.hasMore = this.page * this.perPage < this.total
        } else if (Array.isArray(res.data)) {
          this.pages = res.data
          this.total = res.data.length
          this.hasMore = false
        } else {
          this.pages = []
          this.total = 0
          this.hasMore = false
        }
      } catch (err) {
        console.error('Failed to fetch pages:', err)
      }
    },
    async deletePage(slug) {
      if (!this.permissions.canDelete) return
      if (confirm('Are you sure you want to delete this page?')) {
        try {
          await axios.delete(`${API_ENDPOINTS.posts}/slug/${slug}`)
          this.fetchPages()
        } catch (err) {
          console.error('Failed to delete:', err)
        }
      }
    }
  },
  watch: {
    '$route.params.slug'(newSlug) {
      this.slug = newSlug || ''
      this.page = 1
      if (this.permissions.canView) this.fetchPages()
    },
    page() {
      if (this.permissions.canView) this.fetchPages()
    },
    search() {
      this.page = 1
      if (this.permissions.canView) this.debouncedFetch()
    },
    statusFilter() {
      this.page = 1
      if (this.permissions.canView) this.fetchPages()
    }
  }
}
</script>
