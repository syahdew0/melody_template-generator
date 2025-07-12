<template>
  <div class="p-6 max-w-6xl mx-auto space-y-12">
    <!-- Bagian Settings -->
    <div class="bg-white rounded-3xl shadow-lg p-6">
      <h2 class="text-2xl font-bold text-slate-800 mb-6">Pengaturan Newsletter</h2>

      <p v-if="!isAdmin" class="text-sm text-red-500 mb-4">
        Hanya admin yang dapat mengubah pengaturan ini.
      </p>

      <form @submit.prevent="saveSettings" class="space-y-5">
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Judul</label>
          <input v-model="form.title" type="text" class="form-input" :disabled="!isAdmin" />
        </div>

        <div>
          <label class="block font-semibold mb-1 text-slate-700">Deskripsi</label>
          <textarea v-model="form.description" class="form-textarea" rows="3" :disabled="!isAdmin" />
        </div>

        <div>
          <label class="block font-semibold mb-1 text-slate-700">Placeholder Input</label>
          <input v-model="form.placeholder" type="text" class="form-input" :disabled="!isAdmin" />
        </div>

        <div>
          <label class="block font-semibold mb-1 text-slate-700">Teks Tombol</label>
          <input v-model="form.button" type="text" class="form-input" :disabled="!isAdmin" />
        </div>

        <div>
          <label class="block font-semibold mb-1 text-slate-700">Teks Saat Mengirim</label>
          <input v-model="form.submitting" type="text" class="form-input" :disabled="!isAdmin" />
        </div>

        <div class="flex justify-end" v-if="isAdmin">
          <button type="submit"
            class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded-2xl transition">
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>

    <!-- Bagian Subscriber -->
    <div class="bg-white rounded-3xl shadow-lg p-6">
      <h2 class="text-2xl font-bold text-slate-800 mb-6">Daftar Subscriber</h2>

      <div v-if="subscribers.length === 0" class="text-slate-500">Belum ada subscriber.</div>

      <table v-else class="w-full text-left border-collapse">
        <thead class="bg-amber-100">
          <tr>
            <th class="p-3 font-semibold text-slate-700">#</th>
            <th class="p-3 font-semibold text-slate-700">Email</th>
            <th class="p-3 font-semibold text-slate-700">Tanggal</th>
            <th class="p-3 font-semibold text-slate-700 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(subscriber, index) in subscribers" :key="subscriber.id" class="border-t">
            <td class="p-3">{{ index + 1 }}</td>
            <td class="p-3">{{ subscriber.email }}</td>
            <td class="p-3">{{ formatDate(subscriber.createdAt) }}</td>
            <td class="p-3 text-right">
              <button
                v-if="isAdmin"
                @click="deleteSubscriber(subscriber.id)"
                class="text-red-600 hover:text-red-800 font-semibold">
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';

export default {
  name: 'AdminNewsletter',
  data() {
    return {
      form: {
        title: '',
        description: '',
        placeholder: '',
        button: '',
        submitting: ''
      },
      subscribers: [],
      isAdmin: false
    };
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = user?.role === 'admin';
    this.fetchSettings();
    this.fetchSubscribers();
  },
  methods: {
    async fetchSettings() {
      try {
        const response = await axios.get(API_ENDPOINTS.newsletterSettings);
        if (response.data && response.data.newsletter) {
          Object.assign(this.form, response.data.newsletter);
        }
      } catch (error) {
        console.error('Gagal mengambil data newsletter:', error);
      }
    },
    async saveSettings() {
      if (!this.isAdmin) return;
      try {
        await axios.put(API_ENDPOINTS.newsletterSettings, { newsletter: this.form });
        alert('Pengaturan berhasil disimpan');
      } catch (error) {
        alert('Gagal menyimpan pengaturan');
        console.error(error);
      }
    },
    async fetchSubscribers() {
      try {
        const response = await axios.get(API_ENDPOINTS.newsletterSubscribers);
        this.subscribers = response.data;
      } catch (error) {
        console.error('Gagal mengambil subscriber:', error);
      }
    },
    async deleteSubscriber(id) {
      if (!this.isAdmin) return;
      if (!confirm('Yakin ingin menghapus subscriber ini?')) return;
      try {
        await axios.delete(`${API_ENDPOINTS.newsletterSubscribers}/${id}`);
        this.subscribers = this.subscribers.filter(s => s.id !== id);
      } catch (error) {
        alert('Gagal menghapus subscriber');
        console.error(error);
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  }
};
</script>

<style scoped>
.form-input {
  @apply w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400;
}
.form-textarea {
  @apply w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400;
}
</style>
