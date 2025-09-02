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

    <!-- Hak Frontend -->
    <div>
      <h2 class="text-lg font-semibold mb-3">Hak Frontend</h2>

      <div class="flex gap-4 items-stretch">
        <!-- Input URL kiri -->
        <div class="flex-1 flex flex-col">
          <label class="block mb-2 font-medium">Input URL</label>
          <textarea 
            v-model="frontendBlockedUrlsText" 
            rows="6" 
            class="flex-1 w-full border border-slate-300 rounded-md px-3 py-2 resize-none"
            readonly
          ></textarea>
        </div>

       <!-- URL yang tidak diizinkan -->
<div class="flex-1 flex flex-col gap-4">
  <!-- Label -->
  <label class="block font-medium">URL yang tidak diizinkan</label>

  <!-- Tombol Tambah URL manual -->
  <button 
    @click="addBlockedUrl" 
    class="px-4 py-2 bg-white rounded border border-black hover:bg-slate-300 w-fit"
  >
    Tambah URL
  </button>

  <!-- Tombol Tambah dari Page / Category -->
  <div class="flex flex-col gap-2">
    <button 
      @click="addFromPage" 
      class="px-4 py-2 bg-white rounded border border-black hover:bg-slate-300 w-fit"
    >
      Tambah dari Halaman
    </button>
    <button 
      @click="addFromCategory" 
      class="px-4 py-2 bg-white rounded border border-black hover:bg-slate-300 w-fit"
    >
      Tambah dari Kategori
    </button>
  </div>

  <!-- Tombol Ubah / Hapus -->
  <div class="flex flex-row gap-2">
    <button 
      @click="editFrontend" 
      class="px-4 py-2 bg-white text-black rounded-md border border-slate-300 text-sm"
    >
      Ubah
    </button>
    <button 
      @click="deleteFrontend" 
      class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
    >
      Hapus
    </button>
  </div>
</div>

      </div>
    </div>

    <!-- Tambahkan tepat sebelum div tombol Simpan -->
<div class="flex gap-4 items-stretch">
  <!-- Kiri: Box textarea -->
  <div class="flex-1 flex flex-col">
    <!-- <label class="block mb-2 font-medium">Kategori Terblokir</label> -->
    <textarea 
      v-model="blockedCategoriesText"
      rows="6"
      class="flex-1 w-full border border-slate-300 rounded-md px-3 py-2 resize-none"
      readonly
    ></textarea>
  </div>

  <!-- Kanan: Label dan tombol hapus -->
  <div class="flex-1 flex flex-col justify-center">
    <div>
      <label class="flex items-center justify-start gap-2 mb-2">Tidak diizinkan melihat detail post dengan kategori berikut</label>
       <button 
          @click="addBlockedCategory"
          class="px-3 py-1 bg-white text-black rounded-md border border-slate-300 text-sm"
        >
          Tambah Kategori
        </button>
      <ul class="list-disc pl-5 text-sm text-slate-600">
        <li v-for="cat in blockedCategories" :key="cat">{{ cat }}</li>
        
      </ul>
    
    <button 
      @click="clearBlockedCategories"
      class="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
    >
      Hapus
    </button>
    </div>
  </div>
</div>

<!-- Kategori yang tidak ditampilkan -->
<div class="flex gap-4 items-stretch">
  <!-- Kiri: Box textarea -->
  <div class="flex-1 flex flex-col">
    <textarea 
      v-model="blockedCategoriesText"
      rows="6"
      class="flex-1 w-full border border-slate-300 rounded-md px-3 py-2 resize-none"
      readonly
    ></textarea>
  </div>

  <!-- Kanan: Label dan tombol -->
<div class="flex-1 flex flex-col justify-center">
  <div>
    <!-- Flex row: label + tombol -->
    <div class="flex items-center justify-start gap-2 mb-2">
      <label class="font-medium">Kategori yang tidak ditampilkan pada list</label> 
    </div>
      <button 
        @click="addBlockedCategory"
        class="px-3 py-1 bg-white text-black rounded-md border border-slate-300 text-sm"
      >
        Tambah Kategori
      </button>
    <!-- Daftar kategori -->
    <ul class="list-disc pl-5 text-sm text-slate-600">
      <li v-for="cat in blockedCategories" :key="cat">{{ cat }}</li>
    </ul>

    <!-- Tombol Hapus -->
     
    <button 
      @click="clearBlockedCategories"
      class="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
    >
      Hapus
    </button>
  </div>
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
export default {
  props: ['id'], // ambil id dari route
  data() {
    return {
      roleName: '',
      allCategory: false,
      master: {    // <-- ini yang kurang
      create: false,
      update: false,
      delete: false,
      read: false,
      },
      modulList: [
        { id: 1, name: 'Posts', create: true, update: true, delete: true, read: true },
        { id: 2, name: 'Pages', create: false, update: true, delete: false, read: true },
        { id: 3, name: 'Products', create: true, update: false, delete: false, read: true },
        { id: 4, name: 'Categories', create: true, update: true, delete: true, read: true },
        { id: 5, name: 'Users', create: false, update: false, delete: false, read: true },
        { id: 6, name: 'Settings', create: false, update: false, delete: false, read: true },
        { id: 7, name: 'Orders', create: true, update: true, delete: true, read: true },
        { id: 8, name: 'Comments', create: true, update: true, delete: true, read: true },
        { id: 9, name: 'Themes', create: false, update: false, delete: false, read: true },
        { id: 10, name: 'Media', create: false, update: false, delete: false, read: true },
        { id: 11, name: 'Topup', create: false, update: false, delete: false, read: true },
        { id: 12, name: 'Withdraw', create: false, update: false, delete: false, read: true },
        { id: 13, name: 'Wallet History', create: false, update: false, delete: false, read: true },
        { id: 14, name: 'Adjust', create: false, update: false, delete: false, read: true },

      ],
      frontendInputUrl: '',
      frontendBlockedUrls: []
    }
  },
  computed: {
    frontendBlockedUrlsText() {
      return this.frontendBlockedUrls.join('\n')
    }
  },
  mounted() {
    // Ambil data role berdasarkan id
    const role = this.getRoleById(this.id)
    if(role) this.roleName = role.name
  },
  methods: {
    getRoleById(id) {
      const roles = [
        { id: 1, name: "Administrator" },
        { id: 2, name: "User" },
        { id: 3, name: "Not Login" },
        { id: 4, name: "Order" },
      ]
      return roles.find(r => r.id == id)
    },
    addBlockedUrl() {
      const url = this.frontendInputUrl.trim()
      if(url && !this.frontendBlockedUrls.includes(url)) {
        this.frontendBlockedUrls.push(url)
      }
      this.frontendInputUrl = ''
    },
    toggleAll(field) {
  this.modulList.forEach(modul => {
    modul[field] = this.master[field];
  });
},
    toggleRow(modul) {
    // Jika modul dicentang, centang semua CRUD
    modul.create = modul.selected;
    modul.update = modul.selected;
    modul.delete = modul.selected;
    modul.read = modul.selected;
  },
    addFromPage() { alert('Tambah URL dari halaman') },
    addFromCategory() { alert('Tambah URL dari kategori') },
    editFrontend() { alert('Ubah frontend URL') },
    deleteFrontend() { alert('Hapus frontend URL') },
    saveRole() {
      console.log('Nama Role:', this.roleName)
      console.log('All Category:', this.allCategory)
      console.log('Modul List:', this.modulList)
      console.log('Frontend Blocked URLs:', this.frontendBlockedUrls)
      alert('Role berhasil disimpan!')
    }
  }
}
</script>

<style scoped>
/* flex-1 + items-stretch membuat kiri dan kanan sama tinggi */
</style>
