<template>
  <section class="p-6 max-w-full mx-auto font-poppins">
    <!-- Daftar Paket MLM User -->
    <div class="bg-white rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-6">Daftar Paket MLM User</h2>

      <!-- Hapus & Search -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <button
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          @click="deleteSelected"
        >
          Hapus
        </button>

        <div class="flex items-center gap-2">
          <label>Search:</label>
          <input
            type="text"
            v-model="search"
            placeholder="Cari..."
            class="border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full border text-sm">
          <thead class="bg-gray-100 text-left">
            <tr>
              <th class="p-2 border"><input type="checkbox" /></th>
              <th class="p-2 border">No. Order</th>
              <th class="p-2 border">Paket</th>
              <th class="p-2 border">User</th>
              <th class="p-2 border">Status</th>
              <th class="p-2 border">Tgl Aktifasi</th>
              <th class="p-2 border">Tgl Expired</th>
              <th class="p-2 border">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in paginatedData"
              :key="index"
              class="hover:bg-gray-50"
            >
              <td class="p-2 border">
                <input type="checkbox" v-model="selected" :value="item.noOrder" />
              </td>
              <td class="p-2 border">
                <span class="text-gray-800">{{ item.noOrder }}</span>
              </td>
              <td class="p-2 border">{{ item.package }}</td>
              <td class="p-2 border">{{ item.user }}</td>
              <td class="p-2 border">{{ item.status }}</td>
              <td class="p-2 border">{{ item.tglAktifasi }}</td>
              <td class="p-2 border">{{ item.tglExpired || '-' }}</td>
              <td class="p-2 border">
                <span v-if="item.status === 'Aktif'" class="text-gray-600">
                  Sudah diaktifkan
                </span>
                <span
                  v-else
                  class="text-blue-600 underline cursor-pointer"
                  @click="activate(item.noOrder)"
                >
                  Aktifkan
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex justify-between items-center mt-4">
        <span class="text-sm text-gray-600">
          Menampilkan {{ startItem }} - {{ endItem }} dari {{ filteredData.length }}
        </span>

        <div class="flex gap-2">
          <button
            class="px-3 py-1 border rounded disabled:opacity-50"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Prev
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            class="px-3 py-1 border rounded"
            :class="page === currentPage ? 'bg-blue-500 text-white' : ''"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button
            class="px-3 py-1 border rounded disabled:opacity-50"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { api, API_ENDPOINTS } from "@/config/api";

const tableData = ref([]);
const search = ref("");
const selected = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10); 

onMounted(async () => {
  try {
    const res = await api.get(API_ENDPOINTS.mlmPaketUser);
    tableData.value = res.data.data.map((t) => ({
      noOrder: t.id || "-",
      package: t.package || "-",
      user: t.username || "-",
      status: t.status === "active" ? "Aktif" : t.status,
      tglAktifasi: t.start_date || "-",
      tglExpired: t.end_date || "-",
    }));
  } catch (err) {
    console.error("Gagal load paket user:", err);
  }
});

const filteredData = computed(() =>
  tableData.value.filter((item) =>
    Object.values(item).some((v) =>
      String(v).toLowerCase().includes(search.value.toLowerCase())
    )
  )
);

const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / itemsPerPage.value)
);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredData.value.slice(start, end);
});

const startItem = computed(() =>
  filteredData.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1
);
const endItem = computed(() =>
  Math.min(currentPage.value * itemsPerPage.value, filteredData.value.length)
);
</script>
