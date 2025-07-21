<template>
  <div class=" border-t px-6 pt-4">
    <h3 class="text-lg font-bold mb-2">Ubah Menu: {{ group.name }}</h3>

    <button class="mb-4 bg-blue-600 text-white px-3 py-1 rounded" @click="showForm = true">
      + Tambah Menu
    </button>

    <!-- Form tambah/edit -->
    <div v-if="showForm" class="mb-4 border p-4 bg-gray-50 rounded">
      <label class="block mb-2">Nama Menu</label>
       <input type="text" v-model="form.title" class="border rounded w-full mb-2 p-1" />

      <label class="block mb-2">Path (Link)</label>
      <input type="text" v-model="form.path" class="border rounded w-full mb-2 p-1" />

      <label class="block mb-2">Parent</label>
      <select
        v-model="form.parent_id"
        class="border rounded w-full mb-2 p-1 bg-white text-gray-800"
      >
        <option :value="undefined" class="text-gray-800">Tanpa Induk</option>
        <option
          v-for="item in menuItems"
          :key="item.id"
          :value="item.id"
          class="text-gray-800"
        >
          {{ item.title }}
        </option>
      </select>
      <button class="bg-green-600 text-white px-4 py-1 rounded mr-2" @click="submitForm">
        Simpan
      </button>
      <button class="text-gray-500" @click="resetForm">Batal</button>
    </div>

    <!-- Daftar Menu Items -->
    <ul class="space-y-1">
      <MenuTree :items="treeData" @edit="editItem" @delete="deleteItem" />
    </ul>

    <div class="mt-4">
      <RouterLink to="/admin/menus" class="text-sm text-gray-500">← Kembali ke daftar menu</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import MenuTree from './MenuTree.vue';
import { API_ENDPOINTS } from '@/config/api'; // pastikan path ini benar

const route = useRoute();
const groupId = route.params.id;

const group = ref({});
const menuItems = ref([]);
const treeData = ref([]);
const showForm = ref(false);
const form = ref({ title: '', path: '', parent_id: null });

const loadGroup = async () => {
  const res = await axios.get(API_ENDPOINTS.MENU_GROUP_DETAIL(groupId));
  group.value = res.data;
};

const loadItems = async () => {
  const res = await axios.get(API_ENDPOINTS.MENU_ITEMS(groupId));
  menuItems.value = res.data;
  treeData.value = buildTree(res.data);
};

const buildTree = (items, parentId = null) => {
  return items
    .filter(item => item.parent_id == parentId)
    .map(item => ({
      ...item,
      children: buildTree(items, item.id),
    }));
};

const submitForm = async () => {
  console.log('Form data sebelum kirim:', form.value);

  if (form.value.id) {
    await axios.put(API_ENDPOINTS.UPDATE_MENU_ITEM(form.value.id), form.value);
  } else {
    await axios.post(API_ENDPOINTS.CREATE_MENU_ITEM, {
      ...form.value,
      menu_group_id: groupId,
    });
  }
  resetForm();
  await loadItems();
};


const editItem = (item) => {
  form.value = { ...item };
  showForm.value = true;
};

const deleteItem = async (item) => {
  if (confirm('Yakin ingin hapus menu ini?')) {
    await axios.delete(API_ENDPOINTS.DELETE_MENU_ITEM(item.id));
    await loadItems();
  }
};

const resetForm = () => {
  form.value = { name: '', path: '', parent_id: null };
  showForm.value = false;
};

onMounted(() => {
  loadGroup();
  loadItems();
});
</script>
