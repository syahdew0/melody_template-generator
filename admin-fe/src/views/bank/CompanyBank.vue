<template>
  <section class="p-6 bg-white rounded shadow">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-bold">Master Bank Perusahaan</h1>

      <!-- Tombol Tambah Bank hanya jika ada permission -->
      <button
        v-if="canAddBank"
        @click="openForm()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        + Tambah Bank
      </button>
    </div>

    <!-- Table List -->
    <table class="w-full border text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="border p-2">#</th>
          <th class="border p-2">Nama Bank</th>
          <th class="border p-2">Nama Rekening</th>
          <th class="border p-2">Nomor Rekening</th>
          <th class="border p-2 w-32">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(bank, i) in banks" :key="bank.id" class="hover:bg-gray-50">
          <td class="border p-2 text-center">{{ i + 1 }}</td>
          <td class="border p-2">{{ bank.bank_name }}</td>
          <td class="border p-2">{{ bank.account_name }}</td>
          <td class="border p-2">{{ bank.account_number }}</td>
          <td class="border p-2 text-center">

            <!-- Edit hanya jika ada permission -->
            <button
              v-if="canEditBank"
              @click="openForm(bank)"
              class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-1"
            >
              Edit
            </button>

            <!-- Aktif/Nonaktif hanya jika ada permission -->
            <button
              v-if="bank.is_active && canEditBank"
              @click="deactivateBank(bank.id)"
              class="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded mr-1"
            >
              Nonaktifkan
            </button>

            <button
              v-else-if="!bank.is_active && canEditBank"
              @click="activateBank(bank.id)"
              class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mr-1"
            >
              Aktifkan
            </button>

            <!-- Hapus hanya jika ada permission -->
            <button
              v-if="canDeleteBank"
              @click="deleteBank(bank.id)"
              class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
            >
              Hapus
            </button>

          </td>
        </tr>

        <tr v-if="banks.length === 0">
          <td colspan="5" class="text-center p-4 text-gray-500">Tidak ada data bank</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Form -->
    <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded p-6 shadow w-full max-w-md">
        <h2 class="text-lg font-bold mb-4">{{ form.id ? 'Edit Bank' : 'Tambah Bank' }}</h2>
        <form @submit.prevent="saveBank">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Nama Bank</label>
            <input v-model="form.bank_name" type="text" class="border p-2 w-full rounded" required />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Nama Rekening</label>
            <input v-model="form.account_name" type="text" class="border p-2 w-full rounded" required />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Nomor Rekening</label>
            <input v-model="form.account_number" type="text" class="border p-2 w-full rounded" required />
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="showForm = false" class="px-4 py-2 border rounded">Batal</button>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

// Data
const banks = ref([])
const showForm = ref(false)
const form = ref({
  id: null,
  bank_name: '',
  account_name: '',
  account_number: ''
})

// Permission
// Misal currentUser disimpan di localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
const canAddBank = currentUser.permissions?.includes('bank_add')
const canEditBank = currentUser.permissions?.includes('bank_edit')
const canDeleteBank = currentUser.permissions?.includes('bank_delete')

// Ambil daftar bank
const fetchBanks = async () => {
  try {
    const { data } = await axios.get(API_ENDPOINTS.company_banks)
    banks.value = data.data || []
  } catch (err) {
    console.error(err)
  }
}

// Buka form tambah/edit
const openForm = (bank = null) => {
  if (!bank && !canAddBank) {
    alert('Anda tidak memiliki izin untuk menambahkan bank')
    return
  }

  form.value = bank
    ? { ...bank }
    : { id: null, bank_name: '', account_name: '', account_number: '' }
  showForm.value = true
}

// Simpan data
const saveBank = async () => {
  try {
    if (form.value.id) {
      await axios.put(`${API_ENDPOINTS.company_banks}/${form.value.id}`, form.value)
    } else {
      await axios.post(API_ENDPOINTS.company_banks, form.value)
    }
    showForm.value = false
    fetchBanks()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan data bank')
  }
}

// Hapus data
const deleteBank = async (id) => {
  if (!canDeleteBank) return alert('Anda tidak memiliki izin untuk menghapus bank')
  if (!confirm('Yakin ingin menghapus bank ini?')) return
  try {
    await axios.delete(`${API_ENDPOINTS.company_banks}/${id}`)
    fetchBanks()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus data bank')
  }
}

// Aktif/Nonaktifkan bank
const deactivateBank = async (id) => {
  if (!canEditBank) return alert('Anda tidak memiliki izin untuk menonaktifkan bank')
  if (!confirm('Yakin ingin menonaktifkan bank ini?')) return;
  try {
    await axios.patch(API_ENDPOINTS.deactivate_company_bank(id));
    fetchBanks();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menonaktifkan bank');
  }
};

const activateBank = async (id) => {
  if (!canEditBank) return alert('Anda tidak memiliki izin untuk mengaktifkan bank')
  if (!confirm('Yakin ingin mengaktifkan bank ini?')) return;
  try {
    await axios.patch(API_ENDPOINTS.activate_company_bank(id));
    fetchBanks();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal mengaktifkan bank');
  }
};

onMounted(fetchBanks)
</script>
