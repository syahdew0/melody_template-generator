<template>
  <section class="p-6 bg-white rounded shadow max-w-full mx-auto mt-12">
    <h2 class="text-2xl font-bold mb-4">Daftar Bank</h2>

    <!-- Tombol tambah bank -->
    <div class="mb-4">
      <button @click="openForm()" class="btn bg-green-500 hover:bg-green-600">Tambah Bank</button>
    </div>

    <!-- Tabel daftar bank -->
    <table class="w-full border border-gray-200">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 border">ID</th>
          <th class="p-2 border">Nama Bank</th>
          <th class="p-2 border">Status</th>
          <th class="p-2 border">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bank in banks" :key="bank.id">
          <td class="p-2 border">{{ bank.id }}</td>
          <td class="p-2 border">{{ bank.name }}</td>
          <td class="p-2 border capitalize">{{ bank.status }}</td>
          <td class="p-2 border space-x-2">
            <button @click="editBank(bank)" class="btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">Edit</button>
            <button @click="deleteBank(bank.id)" class="btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Hapus</button>
          </td>
        </tr>
        <tr v-if="banks.length === 0">
          <td colspan="4" class="text-center p-4">Belum ada bank</td>
        </tr>
      </tbody>
    </table>

    <!-- Form tambah / edit bank -->
    <div v-if="showForm" class="mt-6 p-4 border rounded bg-gray-50">
      <h3 class="text-xl font-semibold mb-4">{{ editMode ? 'Edit Bank' : 'Tambah Bank' }}</h3>
      <form @submit.prevent="submitForm" class="space-y-4">
        <input v-model="form.name" type="text" placeholder="Nama Bank" class="input" required />
        <select v-model="form.status" class="input">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div class="flex space-x-2">
          <button type="submit" class="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            {{ editMode ? 'Update' : 'Simpan' }}
          </button>
          <button type="button" @click="closeForm()" class="btn bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">Batal</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import API_ENDPOINTS from '@/config/api'

export default {
  data() {
    return {
      banks: [],
      showForm: false,
      editMode: false,
      form: {
        id: null,
        name: '',
        status: 'active'
      }
    }
  },
  methods: {
    async fetchBanks() {
      try {
        const res = await axios.get(API_ENDPOINTS.banks)
        this.banks = res.data.data
      } catch (err) {
        console.error('Gagal mengambil daftar bank:', err)
      }
    },
    openForm() {
      this.editMode = false
      this.form = { id: null, name: '', status: 'active' }
      this.showForm = true
    },
    closeForm() {
      this.showForm = false
    },
    editBank(bank) {
      this.editMode = true
      this.form = { ...bank }
      this.showForm = true
    },
    async submitForm() {
      try {
        if (this.editMode) {
          // PUT /api/banks/:id
          await axios.put(`${API_ENDPOINTS.banks}/${this.form.id}`, this.form)
        } else {
          // POST /api/banks
          await axios.post(API_ENDPOINTS.banks, this.form)
        }
        await this.fetchBanks()
        this.closeForm()
      } catch (err) {
        console.error('Gagal menyimpan bank:', err)
        alert('Terjadi kesalahan saat menyimpan bank')
      }
    },
    async deleteBank(id) {
      if (!confirm('Yakin ingin menghapus bank ini?')) return
      try {
        await axios.delete(`${API_ENDPOINTS.banks}/${id}`)
        this.fetchBanks()
      } catch (err) {
        console.error('Gagal menghapus bank:', err)
        alert('Terjadi kesalahan saat menghapus bank')
      }
    }
  },
  mounted() {
    this.fetchBanks()
  }
}
</script>

<style scoped>
.input {
  @apply block w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400;
}
.btn {
  @apply py-2 px-4 rounded text-white;
}
</style>
