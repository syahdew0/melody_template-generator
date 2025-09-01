<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Detail Komentar</h1>

    <div v-if="comment" class="border rounded p-6 shadow">
      <p><strong>ID:</strong> {{ comment.id }}</p>
      <p><strong>User:</strong> {{ comment.username }}</p>
      <p><strong>Tipe:</strong> {{ comment.type }}</p>
      <p v-if="comment.post_slug"><strong>Post/Blog:</strong> {{ comment.post_slug }}</p>
      <p v-if="comment.product_id"><strong>Product ID:</strong> {{ comment.product_id }}</p>
      <p class="mt-2"><strong>Konten:</strong></p>
      <p class="border rounded p-2 bg-gray-50">{{ comment.content }}</p>
      <p class="mt-2 text-gray-500"><strong>Dibuat:</strong> {{ formatDate(comment.created_at) }}</p>
      <p><strong>Status:</strong> {{ comment.approved ? 'Approved' : 'Pending' }}</p>

      <div class="mt-4 flex gap-2">
        <button @click="updateStatus(true)" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
        <button @click="updateStatus(false)" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
      </div>
    </div>

    <div v-else class="text-center text-gray-400 py-10">
      Komentar tidak ditemukan.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { API_ENDPOINTS } from "@/config/api";

const route = useRoute();
const comment = ref(null);

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}

async function fetchComment() {
  try {
    const res = await axios.get(API_ENDPOINTS.getCommentById(route.params.id));
    comment.value = {
      ...res.data,
      approved: res.data.approved === true || res.data.approved === 'true'
    };
  } catch (err) {
    console.error("Gagal memuat komentar:", err);
  }
}

async function updateStatus(approved) {
  try {
    await axios.patch(API_ENDPOINTS.updateCommentStatus(comment.value.id), { approved });
    await fetchComment(); // refresh
    alert("Status komentar berhasil diperbarui.");
  } catch (err) {
    console.error("Gagal memperbarui status:", err);
  }
}

onMounted(fetchComment);
</script>
