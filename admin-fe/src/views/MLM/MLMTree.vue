<template>
  <section class="p-6 py-22 max-w-full text-center font-poppins">
    <h2 class="text-2xl font-bold mb-8">MLM Tree (Admin)</h2>

    <!-- Search -->
    <div class="flex justify-center items-center gap-2 mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari username..."
        class="border rounded px-3 py-2 w-64 focus:outline-none focus:ring focus:border-blue-400"
        @keyup.enter="handleSearch"
      />
      <button
        class="px-4 py-2 bg-white text-black rounded border transition"
        @click="handleSearch"
      >
        search
      </button>
    </div>

    <div v-if="loading" class="text-gray-500">Loading tree...</div>
    <div v-else>
      <div v-if="!currentRoot" class="text-red-500">Tidak ada data MLM</div>
      <div v-else class="mlm-tree">
        <!-- Tombol back -->
        <button
          v-if="historyStack.length > 0"
          class="mb-4 px-4 py-2 text-black border rounded"
          @click="backOneStep"
        >
          ← Kembali
        </button>

        <!-- Render MLM Tree -->
        <MlmNode
          :node="currentRoot"
          :max-depth="3"
          :depth="1"
          @edit-node="handleEditNode"
          @focus-node="handleFocusNode"
        />
      </div>
    </div>
  </section>
</template>

<script>
import { API_ENDPOINTS } from "@/config/api";
import MlmNode from "./MLMNode.vue";
import axios from "axios";

export default {
  name: "MLMTree",
  components: { MlmNode },
  data() {
    return {
      loading: true,
      currentRoot: null,
      originalRoot: null,
      historyStack: [],
      searchQuery: "" 
    };
  },
  async mounted() {
    await this.loadMlmTree();
  },
  methods: {
    async loadMlmTree() {
      this.loading = true;
      try {
        const res = await axios.get(`${API_ENDPOINTS.MLMTree}/tree`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        const treeData = res.data?.data?.tree || res.data?.data || res.data || [];
        this.tree = Array.isArray(treeData) ? treeData : [treeData];
        this.originalRoot = this.tree[0] || null;
        this.currentRoot = this.originalRoot;
      } catch (err) {
        console.error("Gagal load MLM tree:", err);
        alert("Gagal memuat MLM tree");
      } finally {
        this.loading = false;
      }
    },
    handleEditNode(node) {
      this.$router.push({
        name: "MLMNode",
        params: { id: node.id }
      });
    },
    handleFocusNode(node) {
      if (this.currentRoot && this.currentRoot.id !== node.id) {
        this.historyStack.push(this.currentRoot);
        this.currentRoot = node;
      }
    },
    backOneStep() {
      if (this.historyStack.length > 0) {
        this.currentRoot = this.historyStack.pop();
      }
    },

    // 🔍 Cari node berdasarkan username
    handleSearch() {
      if (!this.searchQuery) return;

      const found = this.findNodeByUsername(this.originalRoot, this.searchQuery);
      if (found) {
        this.historyStack.push(this.currentRoot);
        this.currentRoot = found;
      } else {
        alert(`Username "${this.searchQuery}" tidak ditemukan`);
      }
    },

    // Recursive traversal tree
    findNodeByUsername(node, username) {
      if (!node) return null;

      if (node.customer?.username?.toLowerCase() === username.toLowerCase()) {
        return node;
      }

      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          const found = this.findNodeByUsername(child, username);
          if (found) return found;
        }
      }

      return null;
    }
  }
};
</script>

<style scoped>
.mlm-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
