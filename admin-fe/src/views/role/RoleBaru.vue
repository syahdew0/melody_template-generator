<template>
  <div class="max-w-full mt-10 p-6 bg-white rounded">
    <h1 class="text-2xl font-bold mb-6">Role Baru</h1>

    <form @submit.prevent="nextStep" class="space-y-4">
      <!-- Nama Role -->
      <div>
        <label class="block mb-1 font-medium" for="roleName">Nama Role</label>
        <input
          type="text"
          id="roleName"
          v-model="roleName"
          placeholder="Masukkan nama role"
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>

      <!-- Tombol Selanjutnya -->
      <div class="flex justify-end">
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Simpan
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { api, API_ENDPOINTS } from "@/config/api";

export default {
  name: "CreateRolePage",
  data() {
    return {
      roleName: "",
    };
  },
  methods: {
    async nextStep() {
      if (!this.roleName.trim()) {
        alert("Nama Role tidak boleh kosong");
        return;
      }

      try {
        const res = await api.post(API_ENDPOINTS.roles.create, {
          name: this.roleName,
          activeModules: [],
          otherModules: [],
        });

        if (res.data && res.data.role?.id) {
          alert(`Role ${res.data.role.name} berhasil dibuat!`);

          this.roleName = "";
        }
      } catch (err) {
        console.error("Role create error:", err.response?.data || err.message);
        alert(err.response?.data?.message || "Gagal membuat role");
      }
    },
  },
};
</script>
