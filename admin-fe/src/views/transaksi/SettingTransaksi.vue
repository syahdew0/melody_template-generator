<template>
  <div class="p-6 max-w-full mx-auto">
    <h2 class="text-2xl font-bold mb-4">Pengaturan Topup & Withdraw</h2>

    <form @submit.prevent="saveSettings" class="space-y-4">
      <div>
        <label class="block font-semibold">Minimal Topup</label>
        <input
          type="text"
          v-model="formattedSettings.min_topup"
          @input="formatSettingInput('min_topup')"
          class="border p-2 w-full"
        />
      </div>

      <div>
        <label class="block font-semibold">Maksimal Topup</label>
        <input
          type="text"
          v-model="formattedSettings.max_topup"
          @input="formatSettingInput('max_topup')"
          class="border p-2 w-full"
        />
      </div>

      <div>
        <label class="block font-semibold">Minimal Withdraw</label>
        <input
          type="text"
          v-model="formattedSettings.min_withdraw"
          @input="formatSettingInput('min_withdraw')"
          class="border p-2 w-full"
        />
      </div>

      <div>
        <label class="block font-semibold">Maksimal Withdraw</label>
        <input
          type="text"
          v-model="formattedSettings.max_withdraw"
          @input="formatSettingInput('max_withdraw')"
          class="border p-2 w-full"
        />
      </div>

      <button
        type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        :disabled="loading"
      >
        Simpan
      </button>
    </form>

    <div v-if="loading" class="mt-4 text-gray-500">Menyimpan...</div>
    <div v-if="success" class="mt-4 text-green-600">Berhasil disimpan!</div>
  </div>
</template>

<script>
import { api, API_ENDPOINTS } from '@/config/api'

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
      formattedSettings: {
        min_topup: '',
        max_topup: '',
        min_withdraw: '',
        max_withdraw: '',
      },
      loading: false,
      success: false,
    }
  },
  mounted() {
    this.fetchSettings()
  },
  methods: {
    formatSettingInput(key) {
      let val = this.formattedSettings[key] || ''
      // ambil hanya angka
      let raw = val.replace(/\D/g, '')
      this.settings[key] = raw ? parseInt(raw) : 0
      // update tampilan dengan ribuan
      this.formattedSettings[key] = raw
        ? parseInt(raw).toLocaleString('id-ID')
        : ''
    },

    async fetchSettings() {
      try {
        const res = await api.get(API_ENDPOINTS.settingTopupWithdraw)
        const allSettings = res.data // [{key, value}, ...]
        allSettings.forEach((s) => {
          if (Object.prototype.hasOwnProperty.call(this.settings, s.key)) {
            this.settings[s.key] = parseInt(s.value) || 0
            this.formattedSettings[s.key] = this.settings[s.key]
              ? this.settings[s.key].toLocaleString('id-ID')
              : ''
          }
        })
      } catch (err) {
        console.error('Gagal ambil settings', err)
      }
    },

    async saveSettings() {
      this.loading = true
      this.success = false

      try {
        const promises = Object.keys(this.settings).map((key) => {
          return api.post(API_ENDPOINTS.settingTopupWithdraw, {
            key,
            value: this.settings[key].toString(),
          })
        })

        await Promise.all(promises)
        this.success = true
      } catch (err) {
        console.error('Gagal simpan settings', err)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
