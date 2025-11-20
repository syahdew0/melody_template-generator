<template>
  <div class="p-6 space-y-6 max-w-full mx-auto bg-white shadow rounded-lg">
    <h1 class="text-2xl font-bold mb-4">
      {{ isEdit ? 'Edit Category' : 'Add New Category' }}
    </h1>

    <form @submit.prevent="handleSubmit" class="space-y-5">

      <!-- Name -->
      <div>
        <label class="block font-semibold mb-1">Name</label>
        <input v-model="form.name" class="w-full border p-2 rounded" required />
      </div>

      <!-- Slug -->
      <div>
        <label class="block font-semibold mb-1">Slug</label>
        <input v-model="form.slug" class="w-full border p-2 rounded" placeholder="(auto-generate if empty)" />
      </div>

      <!-- Description -->
      <div>
        <label class="block font-semibold mb-1">Description</label>
        <textarea v-model="form.description" class="w-full border p-2 rounded" rows="3"></textarea>
      </div>

      <!-- Parent Category -->
      <div>
        <label class="block font-semibold mb-1">Parent Category</label>
        <select v-model="form.parent_id" class="w-full border p-2 rounded">
          <option value="">— None —</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Display In -->
      <div>
        <label class="block font-semibold mb-1">Display In</label>
        <select v-model.number="form.display_in" class="w-full border p-2 rounded">
          <option value="">— None —</option>
          <option v-for="type in postTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">
          Tentukan di mana kategori ini akan ditampilkan.
        </p>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 pt-4">
        <button type="submit" class="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
          {{ isEdit ? 'Update' : 'Save' }}
        </button>
        <router-link to="/admin/categories" class="text-gray-600 hover:underline mt-2">Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

export default {
  data() {
    return {
      form: {
        name: '',
        slug: '',
        description: '',
        parent_id: '',
         parent_ids: [],
        display_in: ''
      },
      isEdit: false,
      categories: [],
      postTypes: []
    }
  },
  async mounted() {
    const id = this.$route.params.id;

    try {
      // Ambil daftar kategori
      const resCategories = await axios.get(API_ENDPOINTS.categories);
      this.categories = resCategories.data.filter(cat => cat.id !== Number(id));

      // Ambil daftar post types dari endpoint
      const resTypes = await axios.get(API_ENDPOINTS.postTypes);

      // Mapping id sesuai database
      const typeMap = { post: 1, page: 2, product: 3, testimonial: 4, custom_page: 5, listing: 6 };
      this.postTypes = resTypes.data.map(name => ({ id: typeMap[name], name }));

      // Jika edit mode, ambil data kategori
      if (id) {
        this.isEdit = true;
        const res = await axios.get(`${API_ENDPOINTS.categories}/${id}`);
        this.form = {
          ...res.data,
          parent_id: res.data.parent_id || '',
          display_in: res.data.display_in || ''
        };
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  },
  methods: {
  async handleSubmit() {
    if (!this.form.slug && this.form.name) {
      this.form.slug = this.form.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
    }

    // Pastikan parent_ids selalu array
    if (this.form.parent_id) {
      this.form.parent_ids = [Number(this.form.parent_id)];
    } else {
      this.form.parent_ids = [];
    }

    try {
      if (this.isEdit) {
        await axios.put(`${API_ENDPOINTS.categories}/${this.$route.params.id}`, this.form);
      } else {
        await axios.post(API_ENDPOINTS.categories, this.form);
      }
      this.$router.push('/admin/categories');
    } catch (err) {
      console.error('Error submitting form:', err.response?.data || err);
    }
  }
}
}
</script>
