<template>
  <section class="p-6 max-w-full mx-auto font-poppins">
    <h1 class="text-2xl font-bold mb-6">Daftar Pengaduan MLM</h1>

    <div class="bg-white shadow rounded-lg p-4">
      <table class="w-full border-collapse border">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="p-2 border">ID</th>
            <th class="p-2 border">Username</th>
            <th class="p-2 border">Subject</th>
            <th class="p-2 border">Status</th>
            <th class="p-2 border">Priority</th>
            <th class="p-2 border">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pengaduans" :key="item.id" class="hover:bg-gray-50">
            <td class="p-2 border">{{ item.id }}</td>
            <td class="p-2 border">{{ item.username }}</td>
            <td class="p-2 border">{{ item.subject }}</td>
            <td class="p-2 border">
              <span :class="statusClass(item.status)">{{ item.status }}</span>
            </td>
            <td class="p-2 border">{{ item.priority }}</td>
            <td class="p-2 border">
              <router-link
                :to="`/mlm/pengaduan/${item.id}`"
                class="text-blue-600 underline hover:text-blue-800"
              >
                Detail
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import axios from "axios";
import API_ENDPOINTS from "@/config/api";

export default {
  name: "MlmPengaduan",
  data() {
    return {
      pengaduans: [],
    };
  },
  methods: {
    async fetchData() {
      try {
        const res = await axios.get(API_ENDPOINTS.mlmComplaints, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        this.pengaduans = res.data.data;
      } catch (err) {
        console.error("Gagal ambil pengaduan:", err);
      }
    },
    statusClass(status) {
      switch (status) {
        case "pending": return "text-yellow-600 font-semibold";
        case "in_progress": return "text-blue-600 font-semibold";
        case "resolved": return "text-green-600 font-semibold";
        case "closed": return "text-gray-600 font-semibold";
        default: return "";
      }
    },
  },
  mounted() {
    this.fetchData();
  },
};

</script>
