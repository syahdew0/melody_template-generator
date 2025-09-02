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
          Selanjutnya
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: "CreateRolePage",
  data() {
    return {
      roleName: "",
    };
  },
  methods: {
    nextStep() {
      // bisa diganti untuk API call atau navigasi ke step berikutnya
      if (this.roleName.trim() === "") {
        alert("Nama Role tidak boleh kosong");
        return;
      }
      alert(`Role baru: ${this.roleName}`);
      // contoh: redirect ke halaman role list atau ke langkah berikutnya
      // this.$router.push('/roles'); 
    },
  },
};
</script>

<style scoped>
/* opsional styling tambahan */
</style>
