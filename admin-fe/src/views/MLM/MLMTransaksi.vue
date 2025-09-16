<template>
  <section class="p-6 max-w-full font-poppins">
    <!-- Judul -->
    <h1 class="text-3xl font-bold mb-6">Transaksi</h1>

    <!-- Tombol Aksi -->
    <div class="flex items-center gap-4 mb-4">
      <button
        class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center gap-2"
        @click="deleteSelected"
        :disabled="selected.length === 0"
      >
        <i class="fas fa-trash"></i> Hapus
      </button>

      <div class="flex items-center gap-2">
        <label for="perPage" class="text-sm">Records per page</label>
        <select
          id="perPage"
          v-model.number="perPage"
          class="border border-gray-300 rounded-md p-1 text-sm"
        >
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <label for="search" class="text-sm">Search:</label>
        <input
          id="search"
          type="text"
          v-model="search"
          placeholder="Cari..."
          class="border border-gray-300 rounded-md p-1 text-sm"
        />
      </div>
    </div>

    <!-- Tabel -->
    <div class="overflow-x-auto border rounded-md">
      <table class="w-full text-sm text-left border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">
              <input type="checkbox" @change="toggleSelectAll" :checked="allSelected"/>
            </th>
            <th class="p-2 border">Tgl. Trx</th>
            <th class="p-2 border">Type</th>
            <th class="p-2 border">Jumlah</th>
            <th class="p-2 border">Dari</th>
            <th class="p-2 border">Ke</th>
            <th class="p-2 border">Ditransfer?</th>
            <th class="p-2 border">Diterima?</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(trx, i) in paginatedTransactions"
            :key="i"
            class="hover:bg-gray-50"
          >
            <td class="p-2 border">
              <input
                type="checkbox"
                v-model="selected"
                :value="trx"
              />
            </td>
            <td class="p-2 border">{{ trx.date }}</td>
            <td class="p-2 border">{{ trx.type }}</td>
            <td class="p-2 border">{{ formatRupiah(trx.amount) }}</td>
            <td class="p-2 border">{{ trx.from }}</td>
            <td class="p-2 border">{{ trx.to }}</td>
            <td class="p-2 border">{{ trx.transferred }}</td>
            <td class="p-2 border">{{ trx.received }}</td>
          </tr>
          <tr v-if="paginatedTransactions.length === 0">
            <td colspan="10" class="p-4 text-center text-gray-500">
              Tidak ada data
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-4 text-sm">
      <span>
        Showing {{ startEntry }} to {{ endEntry }} of
        {{ filteredTransactions.length }} entries
      </span>
      <div class="flex gap-2">
        <button
          class="px-3 py-1 border rounded-md bg-gray-100 text-gray-600"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          ← Previous
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          class="px-3 py-1 border rounded-md"
          :class="page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'"
        >
          {{ page }}
        </button>
        <button
          class="px-3 py-1 border rounded-md bg-gray-100 text-gray-600"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          Next →
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import API_ENDPOINTS, { api } from "@/config/api";
import { onMounted, ref, computed } from "vue";

const transactions = ref([]);
const search = ref("");
const perPage = ref(10);
const currentPage = ref(1);
const selected = ref([]);

onMounted(async () => {
  try {
    const res = await api.get(API_ENDPOINTS.mlmTransactions);
    transactions.value = res.data.rows.map(r => ({
      date: r.date,
      type: r.type,
      amount: r.amount,
      from: r.from,
      to: r.to,
      dueDate: r.dueDate || "-",
      transferred: r.transferred,
      received: r.received
    }));
  } catch (err) {
    console.error("Gagal load transaksi MLM:", err);
  }
});

// Filter + search
const filteredTransactions = computed(() => {
  if (!search.value) return transactions.value;
  return transactions.value.filter(
    (trx) =>
      trx.from?.toLowerCase().includes(search.value.toLowerCase()) ||
      trx.to?.toString().includes(search.value) ||
      trx.type?.toString().toLowerCase().includes(search.value.toLowerCase())
  );
});

// Pagination
const totalPages = computed(() =>
  Math.ceil(filteredTransactions.value.length / perPage.value)
);

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredTransactions.value.slice(start, start + perPage.value);
});

const startEntry = computed(() =>
  filteredTransactions.value.length === 0
    ? 0
    : (currentPage.value - 1) * perPage.value + 1
);

const endEntry = computed(() =>
  Math.min(currentPage.value * perPage.value, filteredTransactions.value.length)
);

function prevPage() { if (currentPage.value > 1) currentPage.value--; }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++; }
function goToPage(page) { currentPage.value = page; }

function formatRupiah(value) {
  if (value == null) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
}

// Select All
const allSelected = computed(() => {
  return paginatedTransactions.value.length > 0 &&
         paginatedTransactions.value.every(trx => selected.value.includes(trx));
});

function toggleSelectAll(event) {
  if (event.target.checked) {
    // tambah semua di current page
    paginatedTransactions.value.forEach(trx => {
      if (!selected.value.includes(trx)) selected.value.push(trx);
    });
  } else {
    // hapus semua di current page
    paginatedTransactions.value.forEach(trx => {
      const index = selected.value.indexOf(trx);
      if (index > -1) selected.value.splice(index, 1);
    });
  }
}

// Delete
function deleteSelected() {
  if (selected.value.length === 0) return;
  if (!confirm(`Hapus ${selected.value.length} transaksi?`)) return;

  // Hapus dari transactions
  selected.value.forEach(trx => {
    const index = transactions.value.indexOf(trx);
    if (index > -1) transactions.value.splice(index, 1);
  });
  // Kosongkan selected
  selected.value = [];
}
</script>

<style>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");
</style>
