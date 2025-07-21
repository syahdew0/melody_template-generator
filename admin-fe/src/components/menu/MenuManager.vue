<template>
  <div class="py-12 px-6">
    <h2 class="text-xl font-bold mb-4">Daftar Menu</h2>
    <table class="w-full border text-sm">
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="p-2">ID</th>
          <th class="p-2">Menu</th>
          <th class="p-2">Bahasa</th>
          <!-- <th class="p-2">Top Menu</th> -->
          <th class="p-2">Main Menu</th>
          <th class="p-2">Footer Menu</th>
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
    // assignMain(id) {
    //   this.assign(id, 'main');
    //   this.unassign(id, 'footer')
    // },
    // unassignMain(id) {
    //   this.unassign(id, 'main');
    //   this.assign(id, 'footer');
    // },
    // assignFooter(id) {
    //   this.assign(id, 'footer');
    //   this.unassign(id, 'main')
    // },
    // unassignFooter(id) {
    //   this.unassign(id, 'footer');
    //   this.assign(id, 'main');
    // },

    
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

  },
};
</script>