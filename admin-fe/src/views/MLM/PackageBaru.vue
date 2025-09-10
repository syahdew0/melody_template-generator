<template>
  <div class="p-6 max-w-full mx-auto">
    <h1 class="text-2xl font-bold mb-6">Paket Baru</h1>

    <form @submit.prevent="submitForm" class="space-y-8">
      <!-- Grid 3 kolom -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-semibold mb-1">Nama</label>
          <input v-model="form.nama" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Prioritas</label>
          <input v-model="form.prioritas" type="number" class="input" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Jumlah Hari</label>
          <input
            v-model="form.jumlah_hari"
            type="number"
            class="input"
            placeholder="-1 = Tidak pernah habis"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Jumlah Shares</label>
          <input v-model="form.jumlah_shares" type="number" class="input" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">ROI</label>
          <input v-model="form.roi" type="number" class="input" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Value</label>
          <input v-model="form.value" type="number" class="input" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Bonus Referral</label>
          <input v-model="form.bonus_referral" type="number" class="input" />
        </div>
        <div class="flex items-center space-x-2 mt-6">
          <input v-model="form.roi_percent" type="checkbox" class="w-4 h-4" />
          <label>Persen?</label>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Pairing</label>
          <input v-model="form.pairing" type="number" class="input" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Max Pairing</label>
          <input v-model="form.max_pairing" type="number" class="input" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Other Matching</label>
          <input v-model="form.other_matching" type="number" class="input" />
        </div>
      </div>

<!-- Checkbox Skip Suspended -->
<div class="space-y-3">
  <h1>Skip Suspended User</h1>
  <div class="flex items-center space-x-2">
    <input v-model="form.skip_suspended" type="checkbox" class="w-4 h-4" />
    <label>Skip Pembagian pada user yang di suspend
</label>
  </div>

  <!-- Pilihan tambahan muncul kalau skip_suspended aktif -->
  <div v-if="form.skip_suspended" class="ml-6 space-y-2">
    <div>
      <input
        type="radio"
        id="skip_option_1"
        value="skip_only"
        v-model="form.skip_suspended_option"
        class="w-4 h-4"
      />
      <label for="skip_option_1" class="ml-2">
        Skip pembagian dan jalankan seperti seharusnya
        <br />
        <span class="text-gray-600 text-sm">
          Level 3 dan 4 hanya di-skip, level lain tetap jalan
        </span>
      </label>
    </div>

    <div>
      <input
        type="radio"
        id="skip_option_2"
        value="pass_up"
        v-model="form.skip_suspended_option"
        class="w-4 h-4"
      />
      <label for="skip_option_2" class="ml-2">
        Skip pembagian dan berikan pembagian ke atasnya
        <br />
        <span class="text-gray-600 text-sm">
          Level 3 & 4 yang suspended → dibagikan ke level 5 & 6 (yang aktif)
        </span>
      </label>
    </div>

    <div>
      <input
        type="radio"
        id="skip_option_3"
        value="random"
        v-model="form.skip_suspended_option"
        class="w-4 h-4"
      />
      <label for="skip_option_3" class="ml-2">
        Skip pembagian dan berikan pembagian secara acak
        <br />
        <span class="text-gray-600 text-sm">
          Akan diacak 2 user untuk menggantikan level 3 & 4
        </span>
      </label>
    </div>
  </div>

  <div>
    <label class="block text-sm font-semibold mb-1">Keterangan</label>
    <textarea v-model="form.keterangan" class="input"></textarea>
  </div>
  <div class="flex items-center space-x-2">
    <input v-model="form.suspended" type="checkbox" class="w-4 h-4" />
    <label>Suspend</label>
  </div>
</div>

      <!-- Matching -->
      <div>
        <h2 class="font-bold text-lg mb-2">Matching</h2>
        <table class="w-full border mb-3">
          <thead class="bg-gray-200">
            <tr>
              <th class="border px-2 py-1 text-center">Level</th>
              <th class="border px-2 py-1 text-left">Percentage</th>
              <!-- <th class="border px-2 py-1 text-center">Aksi</th> -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="(m, i) in form.matchings" :key="i">
              <td class="border px-2 py-1 bg-gray-100 text-center">{{ i + 1 }}</td>
              <td class="border px-2 py-1">
                <input
                  v-model="m.percentage"
                  type="number"
                  placeholder="Percentage"
                  class="input"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button type="button" @click="addMatching" class="btn-secondary">
          + Tambah Level
        </button>
      </div>

      <!-- Random Matching -->
      <div>
        <h2 class="font-bold text-lg mb-2">Random Matching</h2>
        <table class="w-full border mb-3">
          <thead class="bg-gray-200">
            <tr>
              <th class="border px-2 py-1 text-center">Level</th>
              <th class="border px-2 py-1 text-left">Percentage</th>
              <!-- <th class="border px-2 py-1 text-center">Aksi</th> -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rm, i) in form.random_matchings" :key="i">
              <td class="border px-2 py-1 bg-gray-100 text-center">{{ i + 1 }}</td>
              <td class="border px-2 py-1">
                <input
                  v-model="rm.percentage"
                  type="number"
                  placeholder="Percentage"
                  class="input"
                />
              </td>
              
            </tr>
          </tbody>
        </table>
        <div class="flex items-center space-x-2 mb-3">
          <input v-model="form.include_matching_random" type="checkbox" class="w-4 h-4" />
          <label>Include Matching Pada Random Matching?</label>
        </div>
        <button type="button" @click="addRandomMatching" class="btn-secondary">
          + Tambah Level
        </button>
      </div>

      <!-- Submit -->
      <div>
        <button type="submit" class="btn-primary">Simpan</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import axios from "axios";
import { API_ENDPOINTS } from "@/config/api";

const form = reactive({
  nama: "",
  prioritas: 0,
  jumlah_hari: -1,
  jumlah_shares: 0,
  roi: 0,
  roi_percent: false,
  value: 0,
  bonus_referral: 0,
  pairing: 0,
  max_pairing: 0,
  other_matching: 0,
  skip_suspended: false,
   skip_suspended_option: "skip_only",
  keterangan: "",
  suspended: false,
  include_matching_random: false,
  matchings: [{ percentage: 0 }],
  random_matchings: [{ percentage: 0 }],
});

// simpan data
const savePackage = async () => {
  try {
    await axios.post(API_ENDPOINTS.mlmPackages, form, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    alert("Paket MLM berhasil disimpan!");
  } catch (err) {
    console.error("Gagal simpan package:", err);
    alert("Terjadi kesalahan saat menyimpan.");
  }
};

// handler Matching
const addMatching = () => form.matchings.push({ percentage: 0 });
// const removeMatching = (index) => form.matchings.splice(index, 1);

// handler Random Matching
const addRandomMatching = () => form.random_matchings.push({ percentage: 0 });
// const removeRandomMatching = (index) => form.random_matchings.splice(index, 1);

// submit
const submitForm = () => savePackage();
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
