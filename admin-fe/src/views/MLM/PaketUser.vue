<template>
  <section class="p-6 max-w-6xl mx-auto font-poppins">
    <!-- Buat Paket User -->
    <div class="bg-white rounded-lg p-6 mb-8 ">
      <h2 class="text-2xl font-bold mb-6">Buat Paket User</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- No. Order -->
          <div>
            <label class="block text-sm font-medium mb-1">No. Order</label>
            <input
              type="text"
              v-model="form.noOrder"
              class="w-full border rounded-md p-2 bg-white text-gray-600"
            />
          </div>

          <!-- Username -->
          <div>
            <label class="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              v-model="form.username"
              placeholder="Masukkan Username"
              class="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <!-- Paket -->
          <div>
            <label class="block text-sm font-medium mb-1">Paket</label>
            <select
              v-model="form.package"
              class="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="">Pilih Paket</option>
              <option v-for="pkg in packages" :key="pkg" :value="pkg">
                {{ pkg }}
              </option>
            </select>
          </div>
        </div>

        <!-- Suspend -->
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="form.suspend" id="suspend" />
          <label for="suspend" class="text-sm">Suspend</label>
        </div>

        <!-- Simpan -->
        <button
          type="submit"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Simpan
        </button>
      </form>
    </div>

    <!-- Daftar Paket MLM User -->
    <div class="bg-white shadow-md rounded-lg p-6">
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
              v-for="(item, index) in filteredData"
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
                <span
                  v-if="item.status === 'Aktif'"
                  class="text-gray-600"
                >
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
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";

// form data
const form = ref({
  noOrder: "UPKG-00011",
  username: "",
  package: "",
  suspend: false,
});

const packages = ["Paket Q", "Paket A", "Paket B"];

// table data
const tableData = ref([
  {
    noOrder: "UPKG-00011",
    package: "Paket Q",
    user: "dimanalagi",
    status: "Aktif",
    tglAktifasi: "2014-06-24",
    tglExpired: "2014-10-02",
  },

]);

const search = ref("");
const selected = ref([]);

// filtering
const filteredData = computed(() => {
  return tableData.value.filter(
    (item) =>
      item.noOrder.toLowerCase().includes(search.value.toLowerCase()) ||
      item.user.toLowerCase().includes(search.value.toLowerCase())
  );
});

// actions
const handleSubmit = () => {
  alert("Simpan Paket User!");
};

const deleteSelected = () => {
  alert("Hapus: " + selected.value.join(", "));
};

const activate = (noOrder) => {
  alert("Aktifkan paket: " + noOrder);
};
</script>

apa gunanya ini?
