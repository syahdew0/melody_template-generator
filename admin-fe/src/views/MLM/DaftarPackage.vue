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

export default {
  name: "DaftarPackage",
  setup() {
    const packages = ref([]);
    const selected = ref([]);
    const selectAll = ref(false);
    const search = ref("");
    const currentPage = ref(1);
    const rowsPerPage = ref(5);

    // Dummy data
    const dummyData = [
      { id: 1, name: "Starter Pack", days: 30, value: 1000000, roi: 1200000, pairing: 500000, matching_level: 3, suspended: false },
      { id: 2, name: "Silver Pack", days: 60, value: 5000000, roi: 6500000, pairing: 2000000, matching_level: 5, suspended: false },
      { id: 3, name: "Gold Pack", days: 90, value: 10000000, roi: 14000000, pairing: 5000000, matching_level: 7, suspended: false },
      { id: 4, name: "Platinum Pack", days: 180, value: 25000000, roi: 40000000, pairing: 10000000, matching_level: 10, suspended: true },
      { id: 5, name: "Diamond Pack", days: 365, value: 50000000, roi: 100000000, pairing: 20000000, matching_level: 12, suspended: false },
      { id: 6, name: "Titanium Pack", days: 400, value: 75000000, roi: 150000000, pairing: 30000000, matching_level: 15, suspended: false },
      { id: 7, name: "Legend Pack", days: 500, value: 100000000, roi: 250000000, pairing: 40000000, matching_level: 20, suspended: true },
    ];

    const fetchPackages = async () => {
      try {
        // langsung pakai dummy
        packages.value = dummyData;
      } catch (err) {
        console.error("Error load packages:", err);
        packages.value = dummyData;
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

    const deleteSelected = () => {
      if (!selected.value.length) return alert("Pilih paket dulu!");
      if (!confirm("Yakin hapus paket terpilih?")) return;
      packages.value = packages.value.filter(
        pkg => !selected.value.includes(pkg.id)
      );
      selected.value = [];
      selectAll.value = false;
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
