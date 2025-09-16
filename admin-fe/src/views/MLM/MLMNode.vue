<template>
  <div class="mlm-node flex flex-col items-center">
    <!-- Node utama -->
    <div
      class="node-card cursor-pointer hover:bg-gray-100 transition duration-200"
      @click="$emit('focus-node', node)"
    >
      <div class="font-bold text-lg truncate">
        {{ node.customer?.username || 'Kosong' }}
      </div>
      <div v-if="node.package" class="text-md text-gray-500 leading-snug">
        {{ node.package.name }} <br />
        <!-- <span class="font-semibold text-gray-700"> value : {{ node.package.value }}</span> -->
      </div>
    </div>

    <!-- Anak-anak -->
    <div
      v-if="depth < maxDepth"
      class="children flex justify-between w-full mt-10 gap-4 px-6"
    >
      <!-- Left -->
      <div class="child w-1/2 flex flex-col items-center relative">
        <div class="connector"></div>
        <MlmNode
          v-if="leftChild"
          :node="leftChild"
          :depth="depth + 1"
          :max-depth="maxDepth"
          @focus-node="$emit('focus-node', $event)"
        />
        <div v-else class="node-card empty-card">Kosong</div>
      </div>

      <!-- Right -->
      <div class="child w-1/2 flex flex-col items-center relative">
        <div class="connector"></div>
        <MlmNode
          v-if="rightChild"
          :node="rightChild"
          :depth="depth + 1"
          :max-depth="maxDepth"
          @focus-node="$emit('focus-node', $event)"
        />
        <div v-else class="node-card empty-card">Kosong</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MlmNode",
  props: {
    node: Object,
    depth: { type: Number, default: 1 },
    maxDepth: { type: Number, default: 3 }
  },
  computed: {
    leftChild() {
      return this.node.children?.find(c => c.placement_pos === "left") || null;
    },
    rightChild() {
      return this.node.children?.find(c => c.placement_pos === "right") || null;
    }
  }
};
</script>

<style scoped>
.node-card {
  @apply border rounded-lg bg-white shadow-md p-5 text-center w-44 text-sm flex flex-col justify-center;
  min-height: 90px; /* lebih tinggi agar proporsional */
  margin-bottom: 1rem; /* beri jarak antar node */
}

.empty-card {
  @apply text-gray-400 italic bg-gray-50;
  min-height: 100px;
  @apply flex items-center justify-center;
}

/* Garis anak */
.children {
  position: relative;
}

.children::before {
  content: "";
  position: absolute;
  top: -22px;
  left: 15%;
  width: 70%;
  border-top: 2.5px solid #9ca3af;
}

.child .connector {
  width: 2.5px;
  height: 20px;
  background: #9ca3af;
  position: absolute;
  top: -20px;
}
</style>
