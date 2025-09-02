<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Daftar Komentar</h1>

    <!-- Toggle auto-approve global -->
    <!-- <div class="mb-4 flex items-center gap-4">
      <label class="font-medium">Auto Approve Komentar:</label>
      <input type="checkbox" v-model="autoApprove" @change="updateAutoApproveSetting" />
    </div> -->

    <!-- Filter (opsional: post, blog, product) -->
    <div class="mb-4 flex gap-4">
      <select v-model="filterType" @change="fetchComments" class="border p-2 rounded">
        <option value="">Semua</option>
        <option value="post">Post</option>
        <option value="blog">Blog</option>
        <option value="product">Product</option>
      </select>
    </div>

    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-3 py-2">ID</th>
          <th class="border px-3 py-2">User</th>
          <!-- <th class="border px-3 py-2">Tipe</th> -->
          <th class="border px-3 py-2">Komentar</th>
          <th class="border px-3 py-2">Status</th>
          <th class="border px-3 py-2">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="comment in comments" :key="comment.id">
          <td class="border px-3 py-2">{{ comment.id }}</td>
          <td class="border px-3 py-2">{{ comment.username }}</td>
          <!-- <td class="border px-3 py-2">{{ comment.type }}</td> -->
          <td class="border px-3 py-2">{{ comment.content.substring(0, 50) }}...</td>
          <td class="border px-3 py-2">{{ comment.approved ? 'Approved' : 'Pending' }}</td>
          <td class="border px-3 py-2">
            <router-link
              :to="{ name: 'KomentarDetail', params: { id: comment.id } }"
              class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Detail
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="comments.length === 0" class="text-center py-10 text-gray-400">
      Tidak ada komentar ditemukan.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { API_ENDPOINTS } from "@/config/api";

const comments = ref([]);
const filterType = ref("");

// Ambil komentar
async function fetchComments() {
  try {
    const res = await axios.get(API_ENDPOINTS.getAllComments, {
      params: { type: filterType.value },
    });
    comments.value = res.data;
  } catch (err) {
    console.error("Gagal memuat komentar:", err);
  }
}

onMounted(() => {
  fetchComments();
});
</script>
