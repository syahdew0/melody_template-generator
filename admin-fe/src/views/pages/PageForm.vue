<template>
  <div class="flex flex-col lg:flex-row gap-6 p-6">
    <!-- Main Content Area -->
    <div class="flex-1 space-y-4">
      <label class="block font-semibold text-gray-700 ">Title</label>
      <input
        v-model="form.title"
        @input="generateSlug"
        placeholder="Add Title"
        class="w-full text-4xl font-bold focus:outline-none border-none"
      />

      <!-- Quill Editor -->
      <label class="block font-semibold text-gray-700 ">Content</label>
      <quill-editor
        v-model:content="form.content"
        contentType="html"
        class="h-[400px] bg-white border rounded"
      />
      <label class="block font-semibold text-gray-700 ">Excerpt</label>
      <textarea
        v-model="form.excerpt"
        placeholder="Write an excerpt (optional)"
        class="w-full mt-4 p-3 border rounded bg-gray-50"
        rows="3"
      ></textarea>
    </div>

    <!-- Sidebar Settings -->
    <div class="w-full lg:w-1/3 space-y-4">
      <!-- Publish Box -->
      <div class="border rounded bg-white shadow">
        <div class="p-4 font-semibold border-b">Publish</div>
        <div class="p-4 space-y-3">
          <select v-model="form.status" class="w-full border p-2 rounded">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button
            @click="savePage"
            class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {{ isEdit ? 'Update' : 'Publish' }}
          </button>
        </div>
      </div>

      <!-- Slug -->
      <div class="border rounded bg-white shadow">
        <div class="p-4 font-semibold border-b">Permalink</div>
        <div class="p-4">
          <input
            v-model="form.slug"
            class="w-full border p-2 rounded"
            placeholder="Slug"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'


export default {
  components: {
    QuillEditor
  },
  data() {
    return {
      form: {
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        status: 'draft',
        type: 'page',
        website_id: 1,
        user_id: 1
      },
      isEdit: false,
      originalSlug: null
    }
  },
  methods: {
    generateSlug() {
      this.form.slug = this.form.title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
    },
async fetchPageBySlug(slug) {
  try {
    const res = await axios.get(API_ENDPOINTS.pageBySlug(slug));
    this.form = {
      ...res.data,
      type: 'page'
    };
    this.originalSlug = res.data.slug; // 👈 simpan slug awal
    this.isEdit = true;
  } catch (err) {
    console.error('Failed to fetch page by slug:', err);
  }
}
,
 async savePage() {
  try {
    if (this.isEdit) {
      const slugToUse = this.originalSlug || this.form.slug;
      await axios.put(`${API_ENDPOINTS.pages}/slug/${slugToUse}`, this.form);
    } else {
      await axios.post(API_ENDPOINTS.pages, this.form);
    }
    this.$router.push('/admin/pages');
  } catch (err) {
    console.error('Failed to save page:', err);
  }
}
},
mounted() {
  const slug = this.$route.params.slug;
  if (slug) {
    this.fetchPageBySlug(slug);
  }
}
}
</script>

<style scoped>
/* Tambahan styling opsional */
</style>
