<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">Pengaturan Topup & Withdraw</h2>

    <form @submit.prevent="saveSettings" class="space-y-4">
      <div>
        <label class="block font-semibold">Minimal Topup</label>
        <input type="number" v-model.number="settings.min_topup" class="border p-2 w-full" />
      </div>

      <div>
        <label class="block font-semibold">Maksimal Topup</label>
        <input type="number" v-model.number="settings.max_topup" class="border p-2 w-full" />
      </div>

      <div>
        <label class="block font-semibold">Minimal Withdraw</label>
        <input type="number" v-model.number="settings.min_withdraw" class="border p-2 w-full" />
      </div>

      <div>
        <label class="block font-semibold">Maksimal Withdraw</label>
        <input type="number" v-model.number="settings.max_withdraw" class="border p-2 w-full" />
      </div>

      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Simpan
      </button>
    </form>

    <div v-if="loading" class="mt-4 text-gray-500">Menyimpan...</div>
    <div v-if="success" class="mt-4 text-green-600">Berhasil disimpan!</div>
  </div>
</template>

<script>
import { api, API_ENDPOINTS } from '@/config/api';

export default {
  name: 'SettingsTopupWithdraw',
  data() {
    return {
      settings: {
        min_topup: 0,
        max_topup: 0,
        min_withdraw: 0,
        max_withdraw: 0,
      },
      loading: false,
      success: false,
    };
  },
  mounted() {
    this.fetchSettings();
  },
  methods: {
    async fetchSettings() {
  try {
    const res = await api.get(API_ENDPOINTS.settingTopupWithdraw);
    const allSettings = res.data; // asumsi backend mengembalikan array {key, value}
    
    // mapping ke object
    allSettings.forEach(s => {
      if (Object.prototype.hasOwnProperty.call(this.settings, s.key)) {
        this.settings[s.key] = parseInt(s.value) || 0;
      }
    });
  } catch (err) {
    console.error('Gagal ambil settings', err);
  }
},
   async saveSettings() {
  this.loading = true;
  this.success = false;

  try {
    // kirim update per setting
    const promises = Object.keys(this.settings).map(key => {
      return api.post(API_ENDPOINTS.settingTopupWithdraw, {
        key,
        value: this.settings[key].toString(),
      });
    });

    await Promise.all(promises);
    this.success = true;
  } catch (err) {
    console.error('Gagal simpan settings', err);
  } finally {
    this.loading = false;
  }
},
    
  },
};
</script>

<style scoped>
/* opsional styling */
</style>
