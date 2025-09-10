<template>
  <div class="p-6 max-w-full mx-auto">
    <h1 class="text-4xl font-semibold mb-10">Ubah Paket</h1>

    <form @submit.prevent="savePackage" class="space-y-8">
      <!-- Nama -->
      <div>
        <label class="block font-semibold">Nama</label>
        <input v-model="form.nama" class="input" type="text" placeholder="Nama Paket" />
      </div>

      <!-- Prioritas, Jumlah Hari, Jumlah Shares -->
      <div class="grid grid-cols-3 gap-6">
        <div>
          <label class="block font-semibold">Prioritas</label>
          <input v-model="form.prioritas" class="input" type="number" />
        </div>
        <div>
          <label class="block font-semibold">Jumlah Hari</label>
          <input v-model="form.jumlah_hari" class="input" type="number" />
        </div>
        <div>
          <label class="block font-semibold">Jumlah Shares</label>
          <input v-model="form.jumlah_shares" class="input" type="number" />
        </div>
      </div>

      <!-- ROI, Value, Bonus Referral -->
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block font-semibold">ROI</label>
          <input v-model="form.roi" class="input" type="number" />
        </div>
        <div>
          <label class="block font-semibold">Value</label>
          <input v-model="form.value" class="input" type="number" />
        </div>
        <div>
          <label class="block font-semibold">Bonus Referral</label>
          <input v-model="form.bonus_referral" class="input" type="number" />
        </div>
      </div>

      <div>
        <label class="inline-flex items-center mt-1">
          <input type="checkbox" v-model="form.roi_percent" class="mr-2" /> Persen?
        </label>
      </div>

      <!-- Pairing, Max Pairing, Other Matching -->
      <div class="grid grid-cols-3 gap-6">
        <div>
          <label class="block font-semibold">Pairing</label>
          <input v-model="form.pairing" class="input" type="number" />
        </div>
        <div>
          <label class="block font-semibold">Max Pairing</label>
          <input v-model="form.max_pairing" class="input" type="number" />
        </div>
        <div>
          <label class="block font-semibold">Other Matching</label>
          <input v-model="form.other_matching" class="input" type="number" />
        </div>
      </div>

      <!-- Skip Suspended, Keterangan, Suspended -->
      <div class="gap-6 items-end">
        <div class="flex items-center space-x-2">
          <input type="checkbox" v-model="form.skip_suspended" />
          <span>Skip Pembagian pada user yang di suspend</span>
        </div>
        <div>
          <label class="block font-semibold">Keterangan</label>
          <textarea v-model="form.keterangan" class="input"></textarea>
        </div>
        <div class="flex items-center">
          <input type="checkbox" v-model="form.suspended" />
          <span>Suspend</span>
        </div>
      </div>

      <!-- Matching -->
      <div>
        <h2 class="text-lg font-semibold mb-2">Matching</h2>
        <table class="w-full border mb-2">
          <thead class="bg-gray-100">
            <tr>
              <th class="border px-2">Level</th>
              <th class="border px-2">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(m, i) in form.matchings" :key="i">
              <td class="border px-2">{{ i + 1 }}</td>
              <td class="border px-2">
                <input v-model="m.percentage" type="number" class="input" />
              </td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="btn-secondary" @click="addMatching">
          + Tambah Level
        </button>
      </div>

      <!-- Random Matching -->
      <div>
        <h2 class="text-lg font-semibold mb-2">Random Matching</h2>
        <table class="w-full border mb-2">
          <thead class="bg-gray-100">
            <tr>
              <th class="border px-2">Level</th>
              <th class="border px-2">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rm, i) in form.random_matchings" :key="i">
              <td class="border px-2">{{ i + 1 }}</td>
              <td class="border px-2">
                <input v-model="rm.percentage" type="number" class="input" />
              </td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="btn-secondary" @click="addRandomMatching">
          + Tambah Level
        </button>
      </div>

      <div>
        <label class="inline-flex items-center">
          <input type="checkbox" v-model="form.include_matching_random" class="mr-2" />
          Include Matching Pada Random Matching?
        </label>
      </div>

      <!-- Submit -->
      <button type="submit" class="btn-primary">Simpan</button>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { API_ENDPOINTS } from "@/config/api";

export default {
  name: "MLMEdit",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const id = route.params.id;

    const form = ref({
      nama: "",
      prioritas: 0,
      jumlah_hari: 0,
      jumlah_shares: 0,
      roi: 0,
      roi_percent: false,
      value: 0,
      bonus_referral: 0,
      pairing: 0,
      max_pairing: 0,
      other_matching: 0,
      skip_suspended: false,
      keterangan: "",
      suspended: false,
      matchings: [{ percentage: 0 }],
      random_matchings: [{ percentage: 0 }],
      include_matching_random: false,
    });

    // 🔹 load data paket saat edit
    const loadPackage = async () => {
      try {
        const res = await axios.get(`${API_ENDPOINTS.mlmPackages}/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.data) form.value = res.data;
      } catch (err) {
        console.error("Gagal load package:", err);
        alert("Gagal memuat data paket.");
      }
    };

    const addMatching = () => {
      form.value.matchings.push({ percentage: 0 });
    };

    const addRandomMatching = () => {
      form.value.random_matchings.push({ percentage: 0 });
    };

    // 🔹 simpan update paket
    const savePackage = async () => {
      try {
        await axios.put(`${API_ENDPOINTS.mlmPackages}/${id}`, form.value, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        alert("Paket berhasil diperbarui!");
        router.push("/admin/mlm/packages");
      } catch (err) {
        console.error("Gagal update package:", err);
        alert("Terjadi kesalahan saat menyimpan paket.");
      }
    };

    onMounted(() => {
      loadPackage();
    });

    return { form, addMatching, addRandomMatching, savePackage };
  },
};
</script>

<style>
.input {
  @apply border rounded px-2 py-1 w-full;
}
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700;
}
.btn-secondary {
  @apply bg-gray-200 px-3 py-1 rounded hover:bg-gray-300;
}
</style>
