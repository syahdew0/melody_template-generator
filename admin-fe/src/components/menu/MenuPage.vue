<template>
  <div class="flex gap-4">
    <div class="w-1/2">
      <MenuManager @select-group="selectedGroup = $event" />
    </div>
    <div class="w-1/2">
      <MenuDetailManager v-if="selectedGroup" :group="selectedGroup" />
    </div>
  </div>
</template>

<script>
import MenuManager from '@/components/menu/MenuManager.vue';
import MenuDetailManager from '@/components/menu/MenuDetailManager.vue';

export default {
  components: {
    MenuManager,
    MenuDetailManager
  },
  data() {
    return {
      selectedGroup: null
    };
  }
};
</script>
