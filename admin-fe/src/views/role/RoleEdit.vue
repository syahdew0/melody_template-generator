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
        <input type="checkbox" v-model="allCategory" class="h-4 w-4"/>
        <span>Semua Kategori</span>
      </div>
    </div>
<!-- Kategori yang tidak ditampilkan -->
<div v-if="!allCategory" class="flex gap-4 items-stretch mt-4">
  <!-- Kiri: Box textarea -->
  <div class="flex-1 flex flex-col">
    <textarea 
      v-model="blockedCategoriesText"
      rows="6"
      class="flex-1 w-full border border-slate-300 rounded-md px-3 py-2 resize-none"
      readonly
    ></textarea>
  </div>

  <!-- Kanan: Label, daftar, tombol tambah & hapus -->
  <div class="flex-1 flex flex-col justify-center">
    <div>
      <!-- Flex row: label + tombol Tambah -->
      <div class="flex items-center justify-start gap-2 mb-2">
       
        <button 
          @click="addBlockedCategory"
          class="px-3 py-1 bg-white text-black rounded-md border border-slate-300 text-sm"
        >
          Tambah Kategori
        </button>
      </div>

      <!-- Daftar kategori dengan checkbox & tombol hapus per item -->
      <ul class="list-disc pl-5 text-sm text-slate-600">
        <li v-for="(cat, index) in blockedCategories" :key="cat.name" class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="cat.selected" class="h-4 w-4"/>
            <span>{{ cat.name }}</span>
          </div>
          <button @click="removeCategory(index)" class="ml-2 text-red-500 text-sm">Hapus</button>
        </li>
      </ul>

      <!-- Tombol Hapus Semua -->
      <button 
        @click="clearBlockedCategories"
        class="px-3 py-1 bg-white text-black rounded-md border border-slate-300 text-sm"
      >
        Hapus 
      </button>
    </div>
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
      blockedCategories: [],
    };
  },
  computed: {
    blockedCategoriesText() {
      return this.blockedCategories.map(c => c.name).join("\n");
    }
  },
  mounted() {
    this.fetchModules().then(() => this.fetchRole());
  },
  methods: {
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
    const role = res.data.role;

    this.roleName = role.name;

    // Fetch semua kategori
    const categoriesRes = await api.get(API_ENDPOINTS.categories.list); // buat endpoint list kategori
    const allCategories = categoriesRes.data; // [{id, name, slug}, ...]

    // Tandai kategori yang diblokir
    this.blockedCategories = allCategories.map(c => ({
      id: c.id,
      name: c.name,
      selected: (role.blockedCategories || []).some(bc => bc.name === c.name)
    }));

    // Jika semua kategori diizinkan, set allCategory
    this.allCategory = this.blockedCategories.every(c => !c.selected);

    // Sync modul utama
    this.modulList.forEach(mod => {
      const active = role.activeModules.find(m => m.ModuleId === mod.id);
      if (active) {
        mod.create = active.canAdd;
        mod.update = active.canEdit;
        mod.delete = active.canDelete;
        mod.read = active.canView;
        mod.selected = true;
      }
    });

    // Sync other modules
    this.otherModulesList.forEach(mod => {
      mod.selected = role.otherModules.some(om => om.ModuleName === mod.label);
    });

  } catch (err) {
    console.error("Fetch role detail error:", err.response?.data || err.message);
  }
}
,

    async saveRole() {
  try {
    // ===== Payload Main Modules =====
    const activeModulesPayload = this.modulList.map(m => ({
      ModuleId: m.id,
      canAdd: m.create,
      canEdit: m.update,
      canDelete: m.delete,
      canView: m.read,
    }));

    // ===== Payload Other Modules =====
    const otherModulesPayload = this.otherModulesList.map(m => ({
      ModuleName: m.label,
      selected: m.selected,
    }));

    // ===== Payload Blocked Categories =====
    const blockedCategoriesPayload = this.blockedCategories
    .filter(c => c.selected && c.id)  // pastikan id tidak null
    .map(c => ({ id: c.id, name: c.name }));

    // Gabungkan semua otherModules + blockedCategories
    const combinedOtherModules = [
      ...otherModulesPayload,
      ...blockedCategoriesPayload.map(c => ({ ModuleName: c.name, selected: c.selected }))
    ];

    const payload = {
      name: this.roleName,
      activeModules: activeModulesPayload,
      otherModules: combinedOtherModules, 
      blockedCategories: blockedCategoriesPayload,
    };

    // PUT request ke backend
    await api.put(API_ENDPOINTS.roles.update(this.roleId), payload);

    alert("Role berhasil disimpan!");
  } catch (err) {
    console.error("Update role error:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Gagal menyimpan role");
  }
},

    toggleAll(field) {
      this.modulList.forEach(modul => {
        modul[field] = this.master[field];
      });
    },

    toggleRow(modul) {
      modul.create = modul.selected;
      modul.update = modul.selected;
      modul.delete = modul.selected;
      modul.read = modul.selected;
    },

    addBlockedCategory() {
      const name = prompt("Nama kategori?");
      if (name) {
        this.blockedCategories.push({ id: null, name, selected: true });
      }
    },

    removeCategory(index) {
      this.blockedCategories.splice(index, 1);
    },

    clearBlockedCategories() {
      this.blockedCategories = [];
      this.allCategory = true;
    },
  }
};
</script>
