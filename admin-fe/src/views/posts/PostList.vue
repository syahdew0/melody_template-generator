<template>
  <div class="p-6 space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-bold">All Posts</h1>
      <router-link
        v-if="permissions.canAdd"
        to="/admin/posts/create"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Add New
      </router-link>
    </div>

    <!-- Search and filter -->
    <div class="flex flex-wrap gap-4 items-center">
      <input
        v-model="search"
        placeholder="Search posts..."
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
    <table class="min-w-full bg-white border" v-if="posts.length > 0">
      <thead>
        <tr>
          <th class="p-2 border text-left">Title</th>
          <th class="p-2 border text-left">Status</th>
          <th class="p-2 border text-left">Category</th>
          <th class="p-2 border text-left">Published At</th>
          <th class="p-2 border text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts" :key="post.id">
          <td class="p-2 border">{{ post.title }}</td>
          <td class="p-2 border capitalize">{{ post.status }}</td>
          <td class="p-2 border">
           <span v-if="post.categories && post.categories.length">
  {{ post.categories.map(cat => cat.name).join(', ') }}
</span>
            <span v-else>-</span>
          </td>
          <td class="p-2 border">
            {{ post.published_at ? formatDate(post.published_at) : '-' }}
          </td>
          <td class="p-2 border text-right space-x-2">
            <router-link
              v-if="permissions.canEdit"
              :to="`/admin/posts/${post.slug}`"
              class="text-blue-600 hover:underline"
            >
              Edit
            </router-link>
            <button
              v-if="permissions.canDelete"
              @click="deletePost(post.id)"
              class="text-red-600 hover:underline"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Empty -->
    <div v-else class="text-center text-gray-500 py-4">
      No posts found.
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center pt-4">
      <button
        :disabled="page === 1"
        @click="prevPage"
        class="px-4 py-2 border rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span>Page {{ page }}</span>
      <button
        :disabled="!hasMore"
        @click="nextPage"
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
import { API_ENDPOINTS, api } from '@/config/api'

export default {
  data() {
    return {
      posts: [],
      page: 1,
      perPage: 10,
      search: '',
      statusFilter: '',
      selectedCategories: [],
      categories: [],
      total: 0,
      hasMore: false,
      permissions: {
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
      },
    }
  },
  created() {
    this.debouncedFetch = debounce(this.fetchPosts, 300)
  },
  mounted() {
    const queryCategory = this.$route.query.category;
    if (queryCategory) {
      this.selectedCategories = Array.isArray(queryCategory)
        ? queryCategory.map(Number)
        : [Number(queryCategory)];
    }

    this.fetchCategories()
    this.fetchPermissions()
    this.fetchPosts()
  },
  methods: {
    async fetchPermissions() {
      try {
        const res = await api.get(API_ENDPOINTS.userPermissions)
        const postKey = Object.keys(res.data).find(k => k.toLowerCase() === 'post')
        this.permissions = postKey
          ? res.data[postKey]
          : { canView: false, canAdd: false, canEdit: false, canDelete: false }
      } catch (err) {
        console.error('Gagal ambil permissions:', err)
        this.permissions = { canView: false, canAdd: false, canEdit: false, canDelete: false }
      }
    },
    async fetchPosts() {
      try {
        const res = await axios.get(API_ENDPOINTS.posts, {
          params: {
            type: 'post',
            page: this.page,
            limit: this.perPage,
            search: this.search,
            status: this.statusFilter,
            category: this.selectedCategories.length === 1 
              ? this.selectedCategories[0] 
              : (this.selectedCategories.length > 1 
                  ? this.selectedCategories 
                  : undefined)
          }
        })

        if (res.data?.data && typeof res.data.total !== 'undefined') {
          this.posts = res.data.data;
          this.total = res.data.total;
          this.hasMore = this.page * this.perPage < this.total;
        } else {
          this.posts = [];
          this.total = 0;
          this.hasMore = false;
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    },
    async deletePost(id) {
      if (!this.permissions.canDelete) return;
      if (confirm('Delete this post?')) {
        await axios.delete(`${API_ENDPOINTS.posts}/${id}`)
        await this.fetchPosts()
      }
    },
    async fetchCategories() {
      try {
        const res = await axios.get(`${API_ENDPOINTS.categories}`)
        this.categories = res.data
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    nextPage() { this.page++ },
    prevPage() { if (this.page > 1) this.page-- }
  },
  watch: {
    page() { this.fetchPosts() },
    search() { this.page = 1; this.debouncedFetch() },
    statusFilter() { this.page = 1; this.fetchPosts() },
    selectedCategories() { this.page = 1; this.fetchPosts() }
  }
}
</script>
