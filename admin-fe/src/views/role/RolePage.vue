<template>
  <div class="p-6 max-w-full mx-auto">
    <h1 class="text-2xl font-bold mb-4">Data Role</h1>

    <!-- Controls -->
    <div class="flex justify-between mb-4 items-center">
      <div class="flex items-center gap-4">
        <label>
          Records per page:
          <select v-model="perPage" class="border rounded px-2 py-1">
            <option v-for="n in [5,10,25,50]" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
        <button
          class="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
          :disabled="selectedRoles.length === 0"
          @click="deleteSelected"
        >
          Delete Selected
        </button>
      </div>
      <div>
        <input
          type="text"
          v-model="search"
          placeholder="Search..."
          class="border rounded px-2 py-1"
        />
      </div>
    </div>

    <!-- Table -->
    <table class="min-w-full border">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-4 py-2">
            <input type="checkbox" v-model="allSelected" @change="toggleAll" />
          </th>
          <th class="border px-4 py-2">ID</th>
          <th class="border px-4 py-2">Nama</th>
          <th class="border px-4 py-2">Membership</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="role in paginatedData" :key="role.id" class="hover:bg-gray-50">
          <td class="border px-4 py-2 text-center">
            <input type="checkbox" :value="role.id" v-model="selectedRoles" />
          </td>
          <td class="border px-4 py-2">{{ role.id }}</td>
          <td
            class="border px-4 py-2 text-blue-600 cursor-pointer hover:underline"
            @click="goToEditRole(role)"
          >
            {{ role.name }}
          </td>
          <td
            class="border px-4 py-2 text-blue-600 cursor-pointer hover:underline"
            @click="editRole(role, 'membership')"
          >
            {{ role.membership }}
          </td>
        </tr>
        <tr v-if="filteredData.length === 0">
          <td class="border px-4 py-2 text-center" colspan="4">No data found</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="flex justify-between mt-4 items-center">
      <span>Showing {{ startItem }} to {{ endItem }} of {{ filteredData.length }} entries</span>
      <div class="space-x-1">
        <button
          class="px-2 py-1 border rounded"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >← Previous</button>
        <button
          class="px-2 py-1 border rounded"
          v-for="page in totalPages"
          :key="page"
          :class="{'bg-gray-300': page === currentPage}"
          @click="currentPage = page"
        >{{ page }}</button>
        <button
          class="px-2 py-1 border rounded"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >Next →</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RolePage",
  data() {
    return {
      roles: [
        { id: 1, name: "Administrator", membership: "Set Membership" },
        { id: 2, name: "User", membership: "Set Membership" },
        { id: 3, name: "Not Login", membership: "Set Membership" },
        { id: 4, name: "Order", membership: "Set Membership" },
      ],
      perPage: 10,
      currentPage: 1,
      search: "",
      selectedRoles: [],
      allSelected: false,
    };
  },
  computed: {
    filteredData() {
      if (!this.search) return this.roles;
      return this.roles.filter((r) =>
        r.name.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.perPage) || 1;
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredData.slice(start, end);
    },
    startItem() {
      return (this.currentPage - 1) * this.perPage + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.perPage, this.filteredData.length);
    },
  },
  watch: {
    selectedRoles() {
      this.allSelected = this.selectedRoles.length === this.paginatedData.length;
    },
  },
  methods: {
    goToEditRole(role) {
  this.$router.push({ name: 'EditRole', params: { id: role.id } })
},
    editRole(role, field) {
      alert(`Edit Role ${field}: ${role[field]}`);
    },
    deleteSelected() {
      if (confirm(`Delete ${this.selectedRoles.length} selected role(s)?`)) {
        this.roles = this.roles.filter((r) => !this.selectedRoles.includes(r.id));
        this.selectedRoles = [];
      }
    },
    toggleAll() {
      if (this.allSelected) {
        this.selectedRoles = this.paginatedData.map(r => r.id);
      } else {
        this.selectedRoles = [];
      }
    },
  },
};
</script>
