<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">Jaringan MLM - {{ user.username }}</h2>

    <div class="mb-6">
      <h3 class="font-semibold">Paket:</h3>
      <p>{{ registration.mlm_package.name }} - Level: {{ registration.mlm_package.level }}</p>
    </div>

    <div>
      <h3 class="font-semibold">Downline:</h3>
      <ul>
        <li v-for="down in downlines" :key="down.customer.id">
          {{ down.customer.username }} (Paket: {{ down.mlm_package.name }})
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const user = ref({});
const registration = ref({});
const downlines = ref([]);

const customerId = 1; // contoh ID, bisa diambil dari login

onMounted(async () => {
  const res = await axios.get(`/api/mlm/network/${customerId}`);
  user.value = res.data.user;
  registration.value = res.data.registration;
  downlines.value = res.data.downlines;
});
</script>
