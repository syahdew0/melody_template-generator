<template>
  <div class="p-6 max-w-full mx-auto bg-white rounded-lg shadow-md space-y-6">
    <!-- Header -->
    <h1 class="text-2xl font-semibold">Ubah Role</h1>

    <!-- Nama Role -->
    <div>
      <label class="block font-medium mb-2">Nama Role</label>
      <input 
        v-model="roleName" 
        type="text" 
        class="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
    </div>

    <!-- Hak Backend -->
    <div>
      <h2 class="text-lg font-semibold mb-2">Hak Backend</h2>
      <p class="text-sm text-slate-500 mb-3">Berdasarkan Modul</p>
     <div class="overflow-x-auto">
      <table class="w-full border border-slate-300 rounded-lg text-sm">
      <thead class="bg-slate-100">
        <tr>
          <th class="px-4 py-2 text-left">Modul</th>
          <!-- Header CRUD dengan checkbox master -->
          <th class="px-4 py-2 text-center">
            <input type="checkbox" v-model="master.create" @change="toggleAll('create')" class="h-4 w-4"/>
            Buat
          </th>
          <th class="px-4 py-2 text-center">
            <input type="checkbox" v-model="master.update" @change="toggleAll('update')" class="h-4 w-4"/>
            Ubah
          </th>
          <th class="px-4 py-2 text-center">
            <input type="checkbox" v-model="master.delete" @change="toggleAll('delete')" class="h-4 w-4"/>
            Hapus
          </th>
          <th class="px-4 py-2 text-center">
            <input type="checkbox" v-model="master.read" @change="toggleAll('read')" class="h-4 w-4"/>
            Lihat
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="modul in modulList" :key="modul.id" class="border-t">
          <td class="px-4 py-2">
            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                v-model="modul.selected" 
                class="h-4 w-4"
                @change="toggleRow(modul)"
              />
              <span>{{ modul.name }}</span>
            </div>
          </td>
          <td class="px-4 py-2 text-center">
            <input type="checkbox" v-model="modul.create" class="h-4 w-4"/>
          </td>
          <td class="px-4 py-2 text-center">
            <input type="checkbox" v-model="modul.update" class="h-4 w-4"/>
          </td>
          <td class="px-4 py-2 text-center">
            <input type="checkbox" v-model="modul.delete" class="h-4 w-4"/>
          </td>
          <td class="px-4 py-2 text-center">
            <input type="checkbox" v-model="modul.read" class="h-4 w-4"/>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
    </div>

    <!-- Kategori yang diizinkan untuk post -->
    <div>
      <h2 class="text-lg font-semibold mb-2">Kategori yang diizinkan untuk post</h2>
<div class="flex items-center gap-2">
  <input 
    type="checkbox" 
    v-model="allCategory" 
    @change="toggleAllCategories"
    class="h-4 w-4"
  />
  <span>Semua Kategori</span>
</div>
    </div>

<!-- Kategori yang tidak ditampilkan -->
<div v-if="!allCategory" class="flex gap-4 items-start mt-4">
  <!-- Kiri: Box textarea -->
  <div class="flex-1 flex flex-col">
    <textarea 
      v-model="roleCategoriesText"
      rows="6"
      class="flex-1 w-full border border-slate-300 rounded-md px-3 py-2 resize-none"
      readonly
    ></textarea>
  </div>

  <!-- Kanan: Tombol Tambah + List Kategori -->
  <div class="flex flex-col gap-2">
    <!-- Tombol untuk memunculkan list -->
    <button 
      @click="showDropdown = !showDropdown"
      class="px-3 py-1 bg-white text-black rounded-md border border-slate-300 text-sm"
    >
      Tambah Kategori
    </button>

    <!-- List kategori muncul setelah klik -->
    <div v-if="showDropdown" class="mt-2 flex flex-col gap-1 max-h-48 overflow-y-auto border p-2 rounded-md">
     <label 
      v-for="cat in categories" 
      :key="cat.id" 
      class="flex items-center gap-2"
    >
      <input 
        type="checkbox" 
        :value="cat.id" 
        :checked="roleCategories.some(c => c.id === cat.id)"
        @change="toggleCategory(cat, $event.target.checked)"
        class="h-4 w-4"
      />
      <span>{{ cat.name }}</span>
    </label>
    </div>

    <!-- Tombol hapus semua -->
    <button 
      @click="clearBlockedCategories"
      class="px-3 py-1 bg-white text-black rounded-md border border-slate-300 text-sm"
    >
      Hapus Semua
    </button>
  </div>
</div>

<!-- Modul Lainnya -->
<div>
  <h2 class="text-lg font-semibold mb-2">Modul Lainnya</h2>
  <div class="grid grid-cols-2 gap-2">
    <label v-for="mod in otherModulesList" :key="mod.key" class="flex items-center gap-2">
      <input 
        type="checkbox" 
        v-model="mod.selected" 
        class="h-4 w-4"
      />
      <span>{{ mod.label }}</span>
    </label>
  </div>
</div>


    <!-- Tombol Simpan -->
    <div class="text-left">
      <button 
        @click="saveRole"
        class="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-amber-500 transition-colors"
      >
        Simpan
      </button>
    </div>
  </div>
</template>

<script>
import { api, API_ENDPOINTS } from "@/config/api";

export default {
  props: ["id"], // ambil dari route
  data() {
    return {
      roleId: this.$route.params.id,
      roleName: "",
      allCategory: false,
      master: { create: false, update: false, delete: false, read: false },
      modulList: [],          // main modules
      otherModulesList: [],   // other modules
      roleCategories: [],
      categories: [],
      selectedCategoryId: null,
      showDropdown: false,
    };
  },
  computed: {
    roleCategoriesText() {
      return this.roleCategories.map(c => c.name).join("\n");
    }
  },
  methods: {
 toggleCategory(cat, checked) {
    if (checked) {
      if (!this.roleCategories.some(c => c.id === cat.id)) {
        this.roleCategories.push({ id: cat.id, name: cat.name, selected: true });
      }
    } else {
      this.roleCategories = this.roleCategories.filter(c => c.id !== cat.id);
    }

    // update status "Semua Kategori"
    this.allCategory = this.roleCategories.length === this.categories.length;
  },
    async loadPageData() {
      try {
        await this.fetchModules();   // load modulList & otherModulesList
        await this.fetchRole();      // baru mapping dari DB
      } catch (err) {
        console.error("Load page data error:", err);
      }
    },

    async fetchModules() {
      try {
        const res = await api.get(API_ENDPOINTS.modules.list);
        const modules = res.data;

        // Pisahkan main dan other modules
        this.modulList = modules
          .filter(m => m.type === "main")
          .map(m => ({
            id: m.id,
            name: m.name,
            create: false,
            update: false,
            delete: false,
            read: false,
            selected: false,
          }));

        this.otherModulesList = modules
          .filter(m => m.type === "other")
          .map(m => ({
            id: m.id,
            label: m.name,
            selected: false,
          }));
      } catch (err) {
        console.error("Fetch modules error:", err.response?.data || err.message);
      }
    },

    async fetchRole() {
      try {
        const res = await api.get(API_ENDPOINTS.roles.detail(this.roleId));
        const { role, roleCategories } = res.data;

        this.roleName = role.name;

        // === Ambil semua kategori dari master
        const categoriesRes = await api.get(API_ENDPOINTS.categories);
        this.categories = categoriesRes.data;

        // === Mapping roleCategories (hasil dari DB)
        this.roleCategories = roleCategories.map(bc => ({
          id: bc.id,
          name: bc.name,
          selected: true
        }));
        this.allCategory = this.roleCategories.length === this.categories.length;

        // === Mapping modul utama
        role.activeModules.forEach(active => {
          const mod = this.modulList.find(m => m.id === active.ModuleId);
          if (mod) {
            mod.create = !!active.canAdd;
            mod.update = !!active.canEdit;
            mod.delete = !!active.canDelete;
            mod.read = !!active.canView;
            mod.selected = mod.create || mod.update || mod.delete || mod.read;
          }
        });

        // === Mapping modul lainnya
        this.otherModulesList.forEach(mod => {
          mod.selected = role.otherModules.some(om => om.ModuleName === mod.label);
        });
      } catch (err) {
        console.error("Fetch role detail error:", err.response?.data || err.message);
      }
    },

    confirmAddCategory() {
      if (!this.selectedCategoryId) {
        alert("Pilih kategori dulu");
        return;
      }
      const category = this.categories.find(c => c.id === this.selectedCategoryId);
      if (!category) return;

      const exists = this.roleCategories.some(c => c.id === category.id);
      if (exists) {
        alert("Kategori sudah ditambahkan");
        return;
      }

      this.roleCategories.push({
        id: category.id,
        name: category.name,
        selected: true
      });

      this.selectedCategoryId = null;
      this.showDropdown = false;
    },

    cancelDropdown() {
      this.selectedCategoryId = null;
      this.showDropdown = false;
    },

    clearBlockedCategories() {
      this.roleCategories = [];
      this.allCategory = true;
    },

    async saveRole() {
      try {
        const activeModulesPayload = this.modulList.map(m => ({
          ModuleId: m.id,
          canAdd: m.create,
          canEdit: m.update,
          canDelete: m.delete,
          canView: m.read,
        }));

        const otherModulesPayload = this.otherModulesList.map(m => ({
          ModuleName: m.label,
          selected: m.selected,
        }));

        const roleCategoriesPayload = this.roleCategories
          .filter(c => c.selected && c.id)
          .map(c => ({ id: c.id, name: c.name }));

        const payload = {
          id: this.roleId,
          name: this.roleName,
          activeModules: activeModulesPayload,
          otherModules: otherModulesPayload,
          roleCategories: roleCategoriesPayload,
           RoleId: this.roleId,
        };

        await api.put(API_ENDPOINTS.roles.update(this.roleId), payload);
        alert("Role berhasil disimpan!");
      } catch (err) {
        console.error("Update role error:", err.response?.data || err.message);
        alert(err.response?.data?.message || "Gagal menyimpan role");
      }
    },

   toggleAllCategories() {
  if (this.allCategory) {
    // centang semua
    this.roleCategories = this.categories.map(c => ({
      id: c.id,
      name: c.name,
      selected: true
    }));
  } else {
    // kosongkan semua
    this.roleCategories = [];
  }
},
toggleAll(action) {
    // action = 'create' | 'update' | 'delete' | 'read'
    this.modulList.forEach(mod => {
      mod[action] = this.master[action];
      // kalau ada yang diubah jadi true, otomatis modul dianggap selected
      mod.selected = mod.create || mod.update || mod.delete || mod.read;
    });
  },
    toggleRow(modul) {
      modul.create = modul.selected;
      modul.update = modul.selected;
      modul.delete = modul.selected;
      modul.read = modul.selected;
    }
  },
  mounted() {
    this.loadPageData();
  },
};
</script>
