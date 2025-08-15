<template>
  <div class="p-4 max-w-full px-6 py-12 mx-auto">
    <h1 class="text-xl font-bold mb-4">Daftar Customer</h1>

    <!-- Filter Form -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      <!-- Date Filters -->
      <div>
        <label class="block mb-1 font-semibold" for="fromDate">Dari Tanggal:</label>
        <input
          id="fromDate"
          type="date"
          v-model="filters.fromDate"
          class="border rounded px-3 py-1 w-full"
        />
      </div>

      <div>
        <label class="block mb-1 font-semibold" for="toDate">Sampai Tanggal:</label>
        <input
          id="toDate"
          type="date"
          v-model="filters.toDate"
          class="border rounded px-3 py-1 w-full"
        />
      </div>

      <div>
        <label class="block mb-1 font-semibold" for="username">Username:</label>
        <input
          id="username"
          type="text"
          v-model="filters.username"
          placeholder="Cari username..."
          class="border rounded px-3 py-1 w-full"
        />
      </div>

      <!-- Rekening Filters -->
      <div>
        <label class="block mb-1 font-semibold" for="bank">Bank:</label>
        <input
          id="bank"
          type="text"
          v-model="filters.bank"
          placeholder="Cari bank..."
          class="border rounded px-3 py-1 w-full"
        />
      </div>

      <div>
        <label class="block mb-1 font-semibold" for="noRekening">No Rekening:</label>
        <input
          id="noRekening"
          type="text"
          v-model="filters.no_rekening"
          placeholder="Cari no rekening..."
          class="border rounded px-3 py-1 w-full"
        />
      </div>

      <div>
        <label class="block mb-1 font-semibold" for="namaRekening">Nama Rekening:</label>
        <input
          id="namaRekening"
          type="text"
          v-model="filters.nama_rekening"
          placeholder="Cari nama rekening..."
          class="border rounded px-3 py-1 w-full"
        />
      </div>

      <div class="  gap-4 mt-2">
        <button @click="fetchCustomers" class="px-4 max-w-full py-2 bg-blue-600 text-white rounded">
          Cari
        </button>
        <!-- <button @click="resetFilters" class="px-4 py-2 bg-gray-500 text-white rounded">
          Reset
        </button> -->
      </div>
    </div>

    <table class="min-w-full border border-gray-300">
      <thead>
        <tr class="bg-gray-200">
          <th class="border px-4 py-2">ID</th>
          <th class="border px-4 py-2">Username</th>
          <th class="border px-4 py-2">Email</th>
          <th class="border px-4 py-2">Bank</th>
          <th class="border px-4 py-2">No Rekening</th>
          <th class="border px-4 py-2">Nama Rekening</th>
          <th class="border px-4 py-2">Tanggal Registrasi</th>
        </tr>
      </thead>
      <tbody>
  <tr v-if="!hasSearched">
    <td colspan="7" class="text-center py-4">Silakan klik Cari untuk menampilkan data</td>
  </tr>
  
  <tr v-else v-for="customer in customers" :key="customer.id" class="hover:bg-gray-100">
    <td class="border px-4 py-2">{{ customer.id }}</td>
    <td class="border px-4 py-2">{{ customer.username }}</td>
    <td class="border px-4 py-2">{{ customer.email }}</td>
    <td class="border px-4 py-2">{{ customer.bank || '-' }}</td>
    <td class="border px-4 py-2">{{ customer.no_rekening || '-' }}</td>
    <td class="border px-4 py-2">{{ customer.nama_rekening || '-' }}</td>
    <!-- <td class="border px-4 py-2">{{ new Date(customer.createdAt).toLocaleString() }}</td> -->
     <td class="border px-4 py-2">{{ new Date(customer.created_at).toLocaleString() }}</td>
  </tr>

  <tr v-if="hasSearched && customers.length === 0">
    <td colspan="7" class="text-center py-4">Data tidak ditemukan</td>
  </tr>
</tbody>

    </table>

    <p v-if="errorMessage" class="text-red-600 mt-4">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import API_ENDPOINTS from '@/config/api';

function formatDateToInput(date) {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
const hasSearched = ref(false);
const today = new Date();

const filters = ref({
  fromDate: formatDateToInput(today), 
    toDate: formatDateToInput(today),
  username: '',
  bank: '',
  no_rekening: '',
  nama_rekening: '',
});

const customers = ref([]);
const errorMessage = ref('');

const fetchCustomers = async () => {
  errorMessage.value = '';
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      errorMessage.value = 'Token admin tidak ditemukan. Silakan login terlebih dahulu.';
      return;
    }

    const params = {};
    Object.entries(filters.value).forEach(([key, val]) => {
      if (val && val.trim() !== '') {
        params[key] = val;
      }
    });

    const response = await axios.get(API_ENDPOINTS.adminCustomersList, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    customers.value = response.data;
    hasSearched.value = true;
  } catch (error) {
    if (error.response?.status === 401) {
      errorMessage.value = 'Token tidak valid atau sesi telah habis. Silakan login ulang.';
    } else if (error.response?.status === 403) {
      errorMessage.value = 'Anda tidak memiliki akses ke halaman ini.';
    } else {
      errorMessage.value = 'Gagal mengambil data customer.';
    }
    customers.value = [];
  }
};

// const resetFilters = () => {
//   filters.value = {
//     fromDate: formatDateToInput(today), 
//     toDate: formatDateToInput(today),
//     username: '',
//     bank: '',
//     no_rekening: '',
//     nama_rekening: '',
//   };
//   fetchCustomers();
// };

// Auto fetch saat component mounted
// fetchCustomers();
</script>

<style scoped>
table {
  border-collapse: collapse;
}
th,
td {
  text-align: left;
}
</style>
