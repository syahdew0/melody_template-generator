<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">MLM Tree</h1>

    <div class="ml-4">
      <TreeNode :node="treeData" />
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "MLMTree",
  components: {
    TreeNode: {
      props: ["node"],
      setup(props) {
        const isOpen = ref(true);

        const toggle = () => {
          isOpen.value = !isOpen.value;
        };

        return { isOpen, toggle };
      },
      template: `
        <div class="mb-2">
          <div
            class="flex items-center space-x-2 cursor-pointer bg-blue-100 px-3 py-1 rounded hover:bg-blue-200"
            @click="toggle"
          >
            <span v-if="node.downline && node.downline.length > 0">
              <span v-if="isOpen">[-]</span>
              <span v-else>[+]</span>
            </span>
            <span class="font-semibold">{{ node.name }}</span>
            <span class="text-sm text-gray-600">({{ node.level }})</span>
          </div>

          <div v-if="isOpen && node.downline && node.downline.length > 0" class="ml-6 border-l border-gray-300 pl-4 mt-1">
            <TreeNode v-for="child in node.downline" :key="child.id" :node="child" />
          </div>
        </div>
      `,
    },
  },
  setup() {
    const treeData = ref({
      id: 1,
      name: "A",
      level: 1,
      downline: [
        {
          id: 2,
          name: "B",
          level: 2,
          downline: [
            { id: 4, name: "D", level: 3, downline: [] },
            { id: 5, name: "E", level: 3, downline: [] },
          ],
        },
        {
          id: 3,
          name: "C",
          level: 2,
          downline: [
            { id: 6, name: "F", level: 3, downline: [] },
            { id: 7, name: "G", level: 3, downline: [] },
          ],
        },
      ],
    });

    return { treeData };
  },
};
</script>

<style scoped>
/* Optional styling */
</style>
