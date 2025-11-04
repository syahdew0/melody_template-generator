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
      <!-- <label class="block mb-2">Tipe Link</label>
<select v-model="form.type" class="border rounded w-full mb-2 p-1">
  <option value="custom">Custom</option>
  <option value="page">Pages</option>
  <option value="category">Category</option>
</select> -->

<!-- Show dropdown jika tipe page -->
<div v-if="form.type === 'page'">
  <label class="block mb-2">Pilih Pages</label>
  <select v-model="form.slug" class="border rounded w-full mb-2 p-1">
    <option v-for="page in pages" :key="page.slug" :value="page.slug">
      {{ page.title }}
    </option>
  </select>
</div>

<!-- Show slug input jika tipe category -->
<div v-else-if="form.type === 'category'">
  <label class="block mb-2">Slug Kategori</label>
  <input type="text" v-model="form.slug" class="border rounded w-full mb-2 p-1" />
</div>




<!-- Show path input jika custom -->
<div v-else-if="form.type === 'custom'">
  <label class="block mb-2">Path (Link)</label>
  <input type="text" v-model="form.path" class="border rounded w-full mb-2 p-1" />
</div>
<label class="block mb-2">
  <input type="checkbox" v-model="form.openInNewTab" class="mr-2" />
  Buka di tab baru
</label>

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
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import MenuTree from './MenuTree.vue';
import { API_ENDPOINTS } from '@/config/api';

const route = useRoute();
const groupId = route.params.id;

const group = ref({});
const menuItems = ref([]);
const treeData = ref([]);
const showForm = ref(false);

const form = ref({
  id: null,
  title: '',
  type: 'custom',
  slug: '',
  path: '',
  parent_id: null,
  openInNewTab: false,
});

const pages = ref([]);

const loadGroup = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.MENU_GROUP_DETAIL(groupId));
    group.value = res.data;
  } catch (error) {
    console.error('Gagal memuat group menu:', error);
  }
};

const loadPages = async () => {
  try {
    const res = await axios.get(`${API_ENDPOINTS.posts}`, {
      params: { type: 'page', status: 'published', limit: 1000 },
    });
    pages.value = res.data.data || res.data;
  } catch (err) {
    console.error('Gagal ambil daftar halaman:', err);
  }
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
  // Generate path otomatis
  if (form.value.type === 'page') {
    form.value.path = `/pages/${form.value.slug}`;
  } else if (form.value.type === 'category') {
    form.value.path = `/category/${form.value.slug}`;
  }

  try {
    if (form.value.id) {
      // 🔹 Edit data (PUT)
      await axios.put(API_ENDPOINTS.UPDATE_MENU_ITEM(form.value.id), form.value);
    } else {
      // 🔹 Tambah data baru (POST)
      await axios.post(API_ENDPOINTS.CREATE_MENU_ITEM, {
        ...form.value,
        menu_group_id: groupId,
      });
    }

    await loadItems();
    resetForm();
  } catch (err) {
    console.error('Gagal menyimpan menu:', err);
  }
};

const editItem = async (item) => {
  await loadPages();

  if (item.type === 'page' && item.slug) {
    const exists = pages.value.some(p => p.slug === item.slug);
    if (!exists) {
      pages.value.unshift({
        slug: item.slug,
        title: `(Halaman tidak ditemukan: ${item.slug})`
      });
    }
  }

  form.value = {
    id: item.id,
    title: item.title,
    type: item.type || 'custom',
    slug: item.slug || '',
    path: item.path || '',
    parent_id: item.parent_id || null,
    openInNewTab: item.open_in_new_tab || false,
  };

  showForm.value = true;
};

const deleteItem = async (item) => {
  if (confirm('Yakin ingin hapus menu ini?')) {
    await axios.delete(API_ENDPOINTS.DELETE_MENU_ITEM(item.id));
    await loadItems();
  }
};

const resetForm = () => {
  form.value = {
    id: null,
    title: '',
    type: 'custom',
    slug: '',
    path: '',
    parent_id: null,
    openInNewTab: false,
  };
  showForm.value = false;
};

watch(() => form.value.type, async (newType) => {
  if (newType === 'page' && pages.value.length === 0) {
    await loadPages();
    if (!form.value.slug && pages.value.length > 0) {
      form.value.slug = pages.value[0].slug;
    }
  }
});

onMounted(() => {
  loadGroup();
  loadItems();
  loadPages();
});
</script>
