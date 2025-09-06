<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">Manajemen Pengguna</h2>

    <!-- Tombol tambah user -->
    <button
      @click="openModal('add')"
      class="bg-green-600 text-white px-4 py-2 rounded mb-4"
    >
      Tambah User
    </button>

    <!-- Tabel user -->
    <table class="w-full text-left border mb-6">
      <thead>
        <tr>
          <th class="border px-2 py-1">#</th>
          <th class="border px-2 py-1">Nama</th>
          <th class="border px-2 py-1">Email</th>
          <th class="border px-2 py-1">Role</th>
          <th class="border px-2 py-1">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in users" :key="user.id">
          <td class="border px-2 py-1">{{ index + 1 }}</td>
          <td class="border px-2 py-1">{{ user.username }}</td>
          <td class="border px-2 py-1">{{ user.email }}</td>
          <td class="border px-2 py-1">
            <span
              :class="user.role === 'admin' ? 'bg-green-600' : 'bg-gray-500'"
              class="text-white text-xs px-2 py-1 rounded"
            >
              {{ user.role }}<span v-if="user.isSuperAdmin"> 1 </span>
            </span>
          </td>
          <td class="border px-2 py-1 space-x-2">
            <button
              @click="openModal('edit', user)"
              class="bg-yellow-500 text-white px-2 py-1 rounded"
            >
              Edit
            </button>

            <button
              v-if="String(user.id) !== currentUserId && !user.isSuperAdmin"
              @click="deleteUser(user.id)"
              class="bg-red-600 text-white px-2 py-1 rounded"
            >
              Hapus
            </button>
            <span v-else-if="String(user.id) === currentUserId" class="text-gray-400 text-sm italic">
              Tidak bisa hapus diri sendiri
            </span>
            <span v-else class="text-gray-400 text-sm italic">
              Tidak bisa hapus admin utama
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Add/Edit User -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-md w-96">
        <h3 class="text-lg font-bold mb-4">
          {{ modalType === 'add' ? 'Tambah User' : 'Edit User' }}
        </h3>
        <form @submit.prevent="modalType === 'add' ? addUser() : updateUser()">
          <input
            v-model="form.username"
            class="border w-full mb-2 px-2 py-1"
            placeholder="Username"
            required
          />
          <input
            v-model="form.email"
            class="border w-full mb-2 px-2 py-1"
            placeholder="Email"
            type="email"
            required
          />
          <input
            v-model="form.password"
            type="password"
            class="border w-full mb-2 px-2 py-1"
            :placeholder="modalType === 'add' ? 'Password' : 'Password (opsional)'"
            :required="modalType === 'add'"
          />

          <!-- Dropdown Role -->
          <label for="role" class="block mb-1">Pilih Role</label>
          <select v-model="selectedRoleId" id="role" class="border rounded w-full px-2 py-1 mb-4">
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>

          <div class="flex justify-end space-x-2">
            <button
              @click="closeModal"
              type="button"
              class="bg-gray-300 text-black px-4 py-1 rounded"
            >
              Batal
            </button>
            <button
              type="submit"
              :class="modalType === 'add' ? 'bg-green-600' : 'bg-blue-600'"
              class="text-white px-4 py-1 rounded"
            >
              {{ modalType === 'add' ? 'Tambah' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';

const router = useRouter();
const users = ref([]);
const currentUserId = ref(null);
const selectedRoleId = ref(null);
const roles = ref([]);

const showModal = ref(false);
const modalType = ref('add');
const form = ref({ id: null, username: '', email: '', password: '', role: 'user' });

// Fetch users
const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(API_ENDPOINTS.users, { headers: { Authorization: `Bearer ${token}` } });
    users.value = data;
  } catch (err) {
    console.error('Gagal mengambil data user:', err);
  }
};

// Fetch roles
const fetchRoles = async () => {
  try {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(API_ENDPOINTS.roles.list, {
      headers: { Authorization: `Bearer ${token}` }
    });
    roles.value = data;
  } catch (err) {
    console.error('Gagal mengambil data roles:', err);
  }
};

// Open modal Add/Edit
const openModal = (type, user = null) => {
  modalType.value = type;
  if (type === 'edit' && user) {
    form.value = { id: user.id, username: user.username, email: user.email, password: '', role: user.role };
    selectedRoleId.value = user.RoleId || null;
  } else {
    form.value = { id: null, username: '', email: '', password: '', role: 'user' };
    selectedRoleId.value = null;
  }
  showModal.value = true;
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  form.value = { id: null, username: '', email: '', password: '', role: 'user' };
  selectedRoleId.value = null;
};

// Add user
const addUser = async () => {
  try {
    const token = localStorage.getItem('token');
    const payload = { ...form.value, RoleId: selectedRoleId.value };
    await axios.post(API_ENDPOINTS.users, payload, { headers: { Authorization: `Bearer ${token}` } });
    fetchUsers();
    closeModal();
  } catch (err) {
    alert('Gagal tambah user: ' + (err.response?.data?.message || err.message));
  }
};

// Update user
const updateUser = async () => {
  try {
    const token = localStorage.getItem('token');
    const payload = { ...form.value, RoleId: selectedRoleId.value };
    if (!payload.password) delete payload.password;
    await axios.put(API_ENDPOINTS.userById(payload.id), payload, { headers: { Authorization: `Bearer ${token}` } });
    fetchUsers();
    closeModal();
  } catch (err) {
    alert('Gagal update user: ' + (err.response?.data?.message || err.message));
  }
};

// Delete user
const deleteUser = async (id) => {
  if (!confirm('Yakin ingin menghapus user ini?')) return;
  try {
    const token = localStorage.getItem('token');
    await axios.delete(API_ENDPOINTS.userById(id), { headers: { Authorization: `Bearer ${token}` } });
    fetchUsers();
  } catch (err) {
    alert('Gagal menghapus user: ' + (err.response?.data?.message || err.message));
  }
};

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role.toLowerCase() !== 'admin') {
  router.push('/');
}
  else {
    currentUserId.value = String(user.id);
    fetchUsers();
    fetchRoles();
  }
});
</script>
