<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">Manajemen Pengguna</h2>

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
              v-if="user.role !== 'admin'"
              @click="promoteToAdmin(user.id)"
              class="bg-blue-600 text-white px-2 py-1 rounded"
            >
              Jadikan Admin
            </button>
            <span v-else class="text-green-600 font-semibold">Admin</span>

            <button
              @click="openEditModal(user)"
              class="bg-yellow-500 text-white px-2 py-1 rounded"
            >
              Edit
            </button>

         <!-- Tombol hapus -->
            <button
              v-if="String(user.id) !== currentUserId && !user.isSuperAdmin"
              @click="deleteUser(user.id)"
              class="bg-red-600 text-white px-2 py-1 rounded"
            >
              Hapus
            </button>
            <span
              v-else-if="String(user.id) === currentUserId"
              class="text-gray-400 text-sm italic"
            >
              Tidak bisa hapus diri sendiri
            </span>
            <span
              v-else
              class="text-gray-400 text-sm italic"
            >
              Tidak bisa hapus admin utama
            </span>

          </td>
        </tr>
      </tbody>
    </table>

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-md w-96">
        <h3 class="text-lg font-bold mb-4">Edit User</h3>
        <form @submit.prevent="updateUser">
          <input
            v-model="editForm.username"
            class="border w-full mb-2 px-2 py-1"
            placeholder="Username"
          />
          <input
            v-model="editForm.email"
            class="border w-full mb-2 px-2 py-1"
            placeholder="Email"
          />
          <input
            v-model="editForm.password"
            type="password"
            class="border w-full mb-2 px-2 py-1"
            placeholder="Password (opsional)"
          />
          <select
            v-model="editForm.role"
            class="border w-full mb-4 px-2 py-1"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <div class="flex justify-end space-x-2">
            <button
              @click="cancelEdit"
              type="button"
              class="bg-gray-300 text-black px-4 py-1 rounded"
            >
              Batal
            </button>
            <button type="submit" class="bg-blue-600 text-white px-4 py-1 rounded">
              Simpan
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
const showEditModal = ref(false);
const editForm = ref({
  id: null,
  username: '',
  email: '',
  password: '',
  role: 'user',
});

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(API_ENDPOINTS.users, {
      headers: { Authorization: `Bearer ${token}` },
    });
    users.value = data;
  } catch (err) {
    console.error('Gagal mengambil data user:', err);
  }
};

const promoteToAdmin = async (id) => {
  if (!confirm('Yakin ingin menjadikan user ini sebagai admin?')) return;

  try {
    const token = localStorage.getItem('token');
    await axios.put(API_ENDPOINTS.makeAdmin(id), {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  } catch (err) {
    alert('Gagal menjadikan admin: ' + (err.response?.data?.message || err.message));
  }
};

const deleteUser = async (id) => {
  if (String(id) === currentUserId.value) {
    alert('Tidak bisa menghapus diri sendiri.');
    return;
  }

  if (!confirm('Yakin ingin menghapus user ini?')) return;

  try {
    const token = localStorage.getItem('token');
    await axios.delete(API_ENDPOINTS.userById(id), {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  } catch (err) {
    alert('Gagal menghapus user: ' + (err.response?.data?.message || err.message));
  }
};

const openEditModal = (user) => {
  editForm.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    password: '',
    role: user.role,
  };
  showEditModal.value = true;
};

const cancelEdit = () => {
  showEditModal.value = false;
  editForm.value = {
    id: null,
    username: '',
    email: '',
    password: '',
    role: 'user',
  };
};

const updateUser = async () => {
  try {
    const token = localStorage.getItem('token');
    const payload = { ...editForm.value };
    if (!payload.password) delete payload.password;

    await axios.put(API_ENDPOINTS.userById(payload.id), payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchUsers();
    cancelEdit();
  } catch (err) {
    alert('Gagal update user: ' + (err.response?.data?.message || err.message));
  }
};

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') {
    router.push('/');
  } else {
    currentUserId.value = String(user.id);
    fetchUsers();
  }
});
</script>
