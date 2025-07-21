<template>
  <div class="max-w-3xl mx-auto p-6 bg-white rounded shadow">
    <h2 class="text-xl font-semibold mb-4">Pengaturan Website</h2>

    <form @submit.prevent="saveSettings" class="grid grid-cols-1 gap-4">
      <div>
        <label>Judul Website</label>
        <input v-model="form.site_title" type="text" class="form-input w-full" />
      </div>

      <div>
        <label>Title</label>
        <input v-model="form.title" type="text" class="form-input w-full" />
      </div>

      <div>
        <label>Deskripsi</label>
        <textarea v-model="form.site_description" class="form-textarea w-full"></textarea>
      </div>
    
      <div>
        <label>Email Admin</label>
        <input v-model="form.admin_email" type="email" class="form-input w-full" />
      </div>

      <!-- <div>
        <label>Logo URL</label>
        <input v-model="form.logo" type="text" class="form-input w-full" />
      </div> -->

      <div>
        <label>SEO Keywords</label>
        <textarea v-model="form.seo_keywords" class="form-textarea w-full"></textarea>
      </div>

      <div>
        <label>SEO Description</label>
        <textarea v-model="form.seo_description" class="form-textarea w-full"></textarea>
      </div>

      <div>
        <label>Rate</label>
        <input v-model="form.rate" type="number" class="form-input w-full" />
      </div>

      <div class="text-right">
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Simpan Pengaturan
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';

export default {
  name: 'SiteSetting',
  data() {
    return {
      websiteId: null,
      form: {
          title: '',
        site_title: '',
        site_description: '',
        admin_email: '',
        logo: '',
        seo_keywords: '',
        seo_description: '',
        rate: ''
      }
    };
  },
  
  async created() {
    
const websiteId = 1 // ← hardcode sementara

  if (!websiteId) {
    console.error("Website ID tidak ditemukan dari user login.");
    return
  }

  this.websiteId = websiteId
  this.fetchSettings()
},
  methods: {
    async fetchSettings() {
      try {
        const res = await axios.get(API_ENDPOINTS.siteSettings(this.websiteId));
        if (res.data.success) {
          this.form = { ...this.form, ...res.data.settings };
        }
      } catch (err) {
        console.error('Gagal mengambil site setting:', err);
      }
    },
    async saveSettings() {
      try {
        const res = await axios.put(API_ENDPOINTS.siteSettings(this.websiteId), this.form);
        if (res.data.success) {
          alert('Pengaturan berhasil disimpan!');
        }
      } catch (err) {
        console.error('Gagal menyimpan pengaturan:', err);
        alert('Terjadi kesalahan saat menyimpan.');
      }
    }
  }
};
</script>

<style scoped>
.form-input,
.form-textarea {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem;
}
</style>
