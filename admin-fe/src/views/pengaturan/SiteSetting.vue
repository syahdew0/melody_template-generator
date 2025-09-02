<template>
  <div class="max-w-full mx-auto p-6 bg-white rounded shadow">
    <h2 class="text-xl font-semibold mb-4">Pengaturan Website</h2>

    <!-- Auto Approve DI LUAR FORM -->
    <div class="mb-6 flex items-center gap-4">
      <label class="font-medium">Auto Approve Komentar:</label>
      <input type="checkbox" v-model="autoApprove" @change="updateAutoApproveSetting" />
    </div>

    <!-- FORM PENGATURAN WEBSITE -->
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

      <div>
        <label>SEO Keywords</label>
        <textarea v-model="form.seo_keywords" class="form-textarea w-full"></textarea>
      </div>

      <div>
        <label>SEO Description</label>
        <textarea v-model="form.seo_description" class="form-textarea w-full"></textarea>
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
import axios from "axios";
import { API_ENDPOINTS } from "@/config/api";

export default {
  name: "SiteSetting",
  data() {
    return {
      websiteId: 1, // sementara hardcode
      autoApprove: false,
      form: {
        title: "",
        site_title: "",
        site_description: "",
        admin_email: "",
        logo: "",
        seo_keywords: "",
        seo_description: "",
        rate: "",
      },
    };
  },

  async created() {
    this.fetchSettings();
    this.fetchAutoApproveSetting();
  },

  methods: {
    async fetchSettings() {
      try {
        const res = await axios.get(API_ENDPOINTS.siteSettings(this.websiteId));
        if (res.data.success) {
          this.form = { ...this.form, ...res.data.settings };
        }
      } catch (err) {
        console.error("Gagal mengambil site setting:", err);
      }
    },

    async saveSettings() {
      try {
        const res = await axios.put(
          API_ENDPOINTS.siteSettings(this.websiteId),
          this.form
        );
        if (res.data.success) {
          alert("Pengaturan berhasil disimpan!");
        }
      } catch (err) {
        console.error("Gagal menyimpan pengaturan:", err);
        alert("Terjadi kesalahan saat menyimpan.");
      }
    },

    async fetchAutoApproveSetting() {
      try {
        const res = await axios.get(API_ENDPOINTS.commentAutoApprove);
        this.autoApprove = res.data.value; // true / false
      } catch (err) {
        console.error("Gagal memuat setting auto-approve:", err);
      }
    },

    async updateAutoApproveSetting() {
      try {
        await axios.patch(API_ENDPOINTS.commentAutoApprove, {
          value: this.autoApprove,
        });
        alert("Setting auto-approve berhasil diperbarui.");
      } catch (err) {
        console.error("Gagal memperbarui setting auto-approve:", err);
        alert("Gagal memperbarui setting auto-approve.");
      }
    },
  },
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
