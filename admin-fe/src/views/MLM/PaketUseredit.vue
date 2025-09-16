<template>
  <section class="p-6 max-w-2xl font-poppins">
    <!-- Ubah Paket Perusahaan -->
    <div class="bg-white rounded-lg p-6">
      <h2 class="text-4xl font-semibold mb-6">Ubah Paket Perusahaan</h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- No. Order -->
        <div>
          <label class="block text-sm font-medium mb-1">No. Order</label>
          <input
            type="text"
            v-model="form.noOrder"
            class="w-full border rounded-md p-2 bg-gray-100"
            readonly
          />
        </div>

        <!-- Perusahaan -->
        <div>
          <label class="block text-sm font-medium mb-1">Perusahaan</label>
          <select
            v-model="form.company"
            class="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="">Pilih Perusahaan</option>
            <option v-for="c in companies" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <!-- Paket -->
        <div>
          <label class="block text-sm font-medium mb-1">Paket</label>
          <select
            v-model="form.package"
            class="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="">Pilih Paket</option>
            <option v-for="pkg in packages" :key="pkg" :value="pkg">{{ pkg }}</option>
          </select>
        </div>

        <!-- Sisa Post -->
        <div>
          <label class="block text-sm font-medium mb-1">Sisa Post</label>
          <div class="flex items-center">
            <input
              type="number"
              v-model="form.sisaPost"
              class="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
            <span class="ml-2 text-sm text-gray-600">1 = Unlimited</span>
          </div>
        </div>

        <!-- Tgl Aktifasi -->
        <div>
          <label class="block text-sm font-medium mb-1">Tgl Aktifasi</label>
          <input
            type="date"
            v-model="form.tglAktifasi"
            class="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <!-- Tgl Expired -->
        <div>
          <label class="block text-sm font-medium mb-1">Tgl Expired</label>
          <input
            type="date"
            v-model="form.tglExpired"
            class="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <!-- Simpan -->
        <button
          type="submit"
          class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Simpan
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const form = ref({
  noOrder: "",
  company: "",
  package: "",
  sisaPost: 1,
  tglAktifasi: "",
  tglExpired: "",
});

const companies = ["Perusahaan A", "Perusahaan B", "Perusahaan C"];
const packages = ["Paket Q", "Paket A", "Paket B"];

// ambil parameter noOrder dari route
onMounted(() => {
  const noOrder = route.params.noOrder;
  if (noOrder) {
    form.value.noOrder = noOrder;
    // TODO: fetch data paket dari API berdasarkan noOrder
  }
});

const handleSubmit = () => {
  alert("Data berhasil disimpan untuk " + form.value.noOrder);
  router.push("/mlm/paket-user"); // kembali ke list
};
</script>
