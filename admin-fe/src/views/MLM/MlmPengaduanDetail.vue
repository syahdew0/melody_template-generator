<template>
  <section class="p-6 max-w-full mx-auto font-poppins">
    <h1 class="text-2xl font-bold mb-6">Detail Pengaduan</h1>

    <div v-if="pengaduan" class="bg-white shadow rounded-lg p-6">
      <p><strong>ID:</strong> {{ pengaduan.id }}</p>
      <p><strong>Username:</strong> {{ pengaduan.username }}</p>
      <p><strong>Subject:</strong> {{ pengaduan.subject }}</p>
      <p><strong>Message:</strong> {{ pengaduan.message }}</p>
      <p><strong>Status:</strong> {{ pengaduan.status }}</p>
      <p><strong>Priority:</strong> {{ pengaduan.priority }}</p>

      <div class="mt-6">
        <label class="block mb-2">Update Status</label>
        <select v-model="form.status" class="border rounded p-2 w-full">
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div class="mt-4">
        <label class="block mb-2">Update Priority</label>
        <select v-model="form.priority" class="border rounded p-2 w-full">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>


      <div class="mt-6 flex gap-4">
        <button
          @click="updatePengaduan"
          class="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Simpan Perubahan
        </button>
        <!-- <router-link
          to="/mlm/pengaduan"
          class="bg-gray-300 px-4 py-2 rounded"
        >
          Kembali
        </router-link> -->
      </div>
    </div>
  </section>
</template>

<script>
import axios from "axios";
import API_ENDPOINTS from "@/config/api";

export default {
  name: "MlmPengaduanDetail",
  data() {
    return {
      pengaduan: null,
      form: {
        status: "",
        priority: "",
      },
    };
  },
  methods: {
    async fetchDetail() {
      try {
        const id = this.$route.params.id;
        const res = await axios.get(`${API_ENDPOINTS.mlmComplaints}/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        this.pengaduan = res.data.data;
        this.form.status = this.pengaduan.status;
        this.form.priority = this.pengaduan.priority;
      } catch (err) {
        console.error("Gagal ambil detail pengaduan:", err);
      }
    },
    async updatePengaduan() {
      try {
        const id = this.$route.params.id;
        await axios.put(`${API_ENDPOINTS.mlmComplaints}/${id}`, this.form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        alert("Pengaduan berhasil diperbarui");
        this.fetchDetail();
      } catch (err) {
        console.error("Gagal update pengaduan:", err);
        alert("Update pengaduan gagal");
      }
    },
  },
  mounted() {
    this.fetchDetail();
  },
};

</script>
