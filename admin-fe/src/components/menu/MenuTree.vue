<template>
  <ul class="space-y-2">
    <li
      v-for="item in items"
      :key="item.id"
      class="bg-gray-200 border rounded p-3"
    >
      <div class="flex justify-between items-center">
        <div>
          <span class="font-medium">{{ item.title }}</span>
          <!-- <span class="text-sm text-gray-500 ml-2">{{ item.path }}</span> -->
        </div>
        <div class="flex space-x-2">
          <button
            @click="$emit('edit', item)"
            class="text-blue-600 hover:underline text-sm"
          >
            Edit
          </button>
          <button
            @click="$emit('delete', item)"
            class="text-red-600 hover:underline text-sm"
          >
            Hapus
          </button>
        </div>
      </div>

      <!-- Recursive children -->
      <div v-if="item.children?.length" class="mt-2 ml-4 border-l pl-4">
        <MenuTree
          :items="item.children"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </li>
  </ul>
</template>

<script setup>
/* global defineProps */
defineProps({
  items: Array
});
</script>
