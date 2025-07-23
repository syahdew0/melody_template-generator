<template>
  <div class="py-12 px-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Daftar Menu</h2>
      <button
  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
  @click="createMenuGroup"
>
  + Tambah Menu Group
</button>
    </div>

    <h2 class="text-xl font-bold mb-4">Daftar Menu</h2>
    <button
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        @click="createNewMenuGroup"
      >
        + Tambah Menu
      </button>
    <table class="w-full border text-sm">
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="p-2">ID</th>
          <th class="p-2">Menu</th>
          <th class="p-2">Bahasa</th>
          <!-- <th class="p-2">Top Menu</th> -->
          <th class="p-2">Main Menu</th>
          <th class="p-2">Footer Menu</th>
          <th class="p-2">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="menu in menuGroups" :key="menu.id" class="border-t">
          <td class="p-2">{{ menu.id }}</td>
          <td class="p-2 text-blue-600 hover:underline cursor-pointer" @click="goToDetail(menu.id)">
            {{ menu.name }}
          </td>
          <td class="p-2">Indonesia</td>
          <td class="p-2">
            <span v-if="menu.is_main">
              <span class="text-blue-600 font-semibold">Aktif</span> |
              <a @click.prevent="unassignMain(menu.id)" href="#">Non-aktif</a>
            </span>
            <span v-else>
              <a @click.prevent="assignMain(menu.id)" href="#">Aktifkan</a> |
              <span class="text-blue-600">Non-aktif</span>
            </span>
          </td>
          <td class="p-2">
            <span v-if="menu.is_footer">
              <span class="text-blue-600 font-semibold">Aktif</span> |
              <a @click.prevent="unassignFooter(menu.id)" href="#">Non-aktif</a>
            </span>
            <span v-else>
              <a @click.prevent="assignFooter(menu.id)" href="#">Aktifkan</a> |
              <span class="text-blue-600">Non-aktif</span>
            </span>
          </td>
          <td class="p-2 space-x-2">
  <button
    @click="editMenuGroup(menu)"
    class="text-sm text-yellow-600 hover:underline"
  >
    Edit
  </button>
  <button
    @click="deleteMenuGroup(menu.id)"
    class="text-sm text-red-600 hover:underline"
  >
    Hapus
  </button>
</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';

export default {
  data() {
    return {
      menuGroups: [],
    };
  },
  mounted() {
    this.fetchMenuGroups();
  },
  methods: {
    fetchMenuGroups() {
      axios.get(API_ENDPOINTS.MENU_GROUPS).then(res => {
        this.menuGroups = res.data;
      });
    },
    createMenuGroup() {
  axios.post(API_ENDPOINTS.MENU_GROUPS, {
    name: 'Menu Baru',
    // Tambahan field lain jika perlu (misal: slug, bahasa, dsb.)
  }).then(res => {
    const newMenu = res.data;
    this.$router.push(`/admin/menus/${newMenu.id}`);
  }).catch(err => {
    console.error('Gagal menambahkan menu:', err);
    alert('Gagal membuat menu baru.');
  });
},
   assign(id, type) {
      axios.post(API_ENDPOINTS.ASSIGN_MENU(id), { type })
        .then(() => {
          const index = this.menuGroups.findIndex(m => m.id === id);
          if (index !== -1) this.menuGroups[index][`is_${type}`] = true;
        })
    },
    unassign(id, type) {
      axios.post(API_ENDPOINTS.UNASSIGN_MENU(id), { type })
        .then(() => {
          const index = this.menuGroups.findIndex(m => m.id === id);
          if (index !== -1) this.menuGroups[index][`is_${type}`] = false;
        });
    },
    goToDetail(id) {
      this.$router.push(`/admin/menus/${id}`);
    },
    
    assignMain(id) {
  this.assign(id, 'main');
},
unassignMain(id) {
  this.unassign(id, 'main');
},
assignFooter(id) {
  this.assign(id, 'footer');
},
unassignFooter(id) {
  this.unassign(id, 'footer');
},
async createNewMenuGroup() {
  const name = prompt('Nama Menu Baru');
  if (!name) return;
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  try {
    const res = await axios.post(API_ENDPOINTS.CREATE_MENU_GROUP, { name, slug });
    const newGroup = res.data;
    this.menuGroups.push(newGroup);
    this.goToDetail(newGroup.id);
  } catch (err) {
    console.error('Gagal menambahkan menu group:', err);
    alert('Gagal menambahkan menu');
  }
},

    async editMenuGroup(menu) {
    const newName = prompt('Ubah nama menu:', menu.name);
    if (!newName || newName === menu.name) return;

    try {
      const res = await axios.put(API_ENDPOINTS.UPDATE_MENU_GROUP(menu.id), { name: newName });
      const updated = res.data;
      const index = this.menuGroups.findIndex(m => m.id === updated.id);
      if (index !== -1) this.menuGroups[index].name = updated.name;
    } catch (err) {
      console.error('Gagal edit:', err);
      alert('Gagal mengedit menu');
    }
  },

  async deleteMenuGroup(id) {
    const confirmDelete = confirm('Yakin ingin hapus menu ini?');
    if (!confirmDelete) return;

    try {
     await axios.delete(API_ENDPOINTS.DELETE_MENU_GROUP(id));
      this.menuGroups = this.menuGroups.filter(m => m.id !== id);
    } catch (err) {
      console.error('Gagal hapus:', err);
      alert('Gagal menghapus menu');
    }
  },
  },
};
</script>