// stores/useAuthStore.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    permissions: {} 
  }),
  actions: {
    async fetchUserPermissions() {
      try {
        const res = await axios.get(API_ENDPOINTS.USER_PERMISSIONS)
        this.permissions = res.data || {}
      } catch (err) {
        console.error('Gagal fetch permissions:', err)
      }
    },
    hasPermission(module, action) {
      return !!this.permissions[module]?.[action]
    }
  }
})
