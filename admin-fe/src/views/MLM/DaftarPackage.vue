<template>
  <div class="p-6 max-w-full mx-auto">
    <h1 class="text-2xl font-bold mb-6">Data Paket MLM</h1>

    <!-- Kontrol atas -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-2 md:space-y-0">
      <div class="flex items-center space-x-2">
        <button
          class="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700"
          @click="deleteSelected"
        >
          🗑 Hapus
        </button>

        <div class="flex items-center space-x-2">
          <label>Record per page:</label>
          <select v-model.number="rowsPerPage" class="border rounded p-1">
            <option v-for="n in [5,10,20,50]" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>

      <input
        type="text"
        v-model="search"
        placeholder="Cari paket..."
        class="border rounded p-2 w-full md:w-64"
      />
    </div>

    <!-- Tabel -->
    <div class="overflow-x-auto">
      <table class="display w-full border text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-2">
              <input type="checkbox" @change="toggleAll" v-model="selectAll" />
            </th>
            <th class="px-2">ID</th>
            <th class="px-2">Paket</th>
            <th class="px-2">Hari</th>
            <th class="px-2">Value</th>
            <th class="px-2">ROI</th>
            <th class="px-2">Pairing</th>
            <th class="px-2">Matching Level</th>
            <th class="px-2">Suspended</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pkg in paginatedPackages || []" :key="pkg.id" class="hover:bg-gray-50">
            <td class="text-center">
              <input type="checkbox" v-model="selected" :value="pkg.id" />
            </td>
            <td class="text-center">{{ pkg.id }}</td>
            <td>
            <router-link
              :to="{ name: 'MLMEdit', params: { id: pkg.id } }"
              class="text-blue-600 underline hover:text-blue-800"
            >
              {{ pkg.name }}
            </router-link>
          </td>
            <td class="text-center">{{ pkg.days }}</td>
            <td class="text-right">{{ formatCurrency(pkg.value) }}</td>
            <td class="text-right">{{ formatCurrency(pkg.roi) }}</td>
            <td class="text-right">{{ formatCurrency(pkg.pairing) }}</td>
            <td class="text-center">{{ pkg.matching_level }}</td>
            <td class="text-center">{{ pkg.suspended ? 'Ya' : 'Tdk' }}</td>
          </tr>
          <tr v-if="(paginatedPackages?.length || 0) === 0">
            <td colspan="9" class="text-center py-4 text-gray-500">Tidak ada data</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-4">
      <div>
        Menampilkan {{ paginatedPackages?.length || 0 }} dari {{ filteredPackages?.length || 0 }} paket
      </div>
      <div class="flex items-center space-x-2">
        <button
          class="border px-3 py-1 rounded hover:bg-gray-100"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Prev
        </button>
        <span>Page {{ currentPage }} / {{ totalPages || 1 }}</span>
        <button
          class="border px-3 py-1 rounded hover:bg-gray-100"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";
import { API_ENDPOINTS } from "@/config/api";

export default {
  name: "DaftarPackage",
  setup() {
    const packages = ref([]);
    const selected = ref([]);
    const selectAll = ref(false);
    const search = ref("");
    const currentPage = ref(1);
    const rowsPerPage = ref(5);

    const fetchPackages = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.mlmPackages, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    // asumsikan API merespons array paket
packages.value = res.data.map(pkg => ({
  id: pkg.MLMPackageID,
  name: pkg.MLMPackageName,
  days: pkg.Days,
  value: pkg.PackageValue,
  roi: pkg.ROI,
  pairing: pkg.Pairing,
  matching_level: pkg.MatchingLevel,
  suspended: Boolean(pkg.IsSuspend),
}));

  } catch (err) {
    console.error("Error load packages:", err);
    packages.value = [];
  }
};


    const filteredPackages = computed(() => {
      const pkgs = packages.value || [];
      if (!search.value) return pkgs;
      return pkgs.filter(pkg =>
        pkg.name?.toLowerCase().includes(search.value.toLowerCase())
      );
    });

    const totalPages = computed(() =>
      Math.ceil((filteredPackages.value?.length || 0) / rowsPerPage.value) || 1
    );

    const paginatedPackages = computed(() => {
      const pkgs = filteredPackages.value || [];
      const start = (currentPage.value - 1) * rowsPerPage.value;
      return pkgs.slice(start, start + rowsPerPage.value);
    });

    watch(search, () => (currentPage.value = 1));

    watch([selected, paginatedPackages], () => {
      selectAll.value =
        paginatedPackages.value?.length > 0 &&
        paginatedPackages.value.every(p => selected.value.includes(p.id));
    });

    const toggleAll = () => {
      if (selectAll.value) {
        selected.value = paginatedPackages.value.map(p => p.id);
      } else {
        selected.value = selected.value.filter(
          id => !paginatedPackages.value.some(p => p.id === id)
        );
      }
    };

const deleteSelected = async () => {
  if (!selected.value.length) return alert("Pilih paket dulu!");
  if (!confirm("Yakin hapus paket terpilih?")) return;

  try {
    await Promise.all(
      selected.value.map(id =>
        axios.delete(`${API_ENDPOINTS.mlmPackages}/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      )
    );
    alert("Paket berhasil dihapus!");
    selected.value = [];
    selectAll.value = false;
    fetchPackages(); // reload data setelah hapus
  } catch (err) {
    console.error("Gagal hapus paket:", err);
    alert("Terjadi kesalahan saat menghapus paket.");
  }
};


    const formatCurrency = val =>
      new Intl.NumberFormat("id-ID").format(val);

    onMounted(fetchPackages);

    return {
      packages,
      selected,
      selectAll,
      toggleAll,
      deleteSelected,
      formatCurrency,
      search,
      currentPage,
      rowsPerPage,
      totalPages,
      paginatedPackages,
      filteredPackages,
    };
  },
};
</script>

<style>
table.display {
  border-collapse: collapse;
}
table.display th,
table.display td {
  border: 1px solid #ddd;
  padding: 8px;
  white-space: nowrap;
}
</style>
