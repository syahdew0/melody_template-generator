<template>
  <div class="p-6 max-w-full mx-auto">
    <h1 class="text-2xl font-bold mb-6">Paket Baru</h1>

    <form @submit.prevent="submitForm" class="space-y-8">
      <!-- Grid 3 kolom -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-semibold mb-1">Nama</label>
          <input v-model="form.nama" type="text" class="w-full border rounded p-2" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Prioritas</label>
          <input v-model="form.prioritas" type="number" class="w-full border rounded p-2" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Jumlah Hari</label>
          <input v-model="form.jumlahHari" type="number" class="w-full border rounded p-2" placeholder="-1 = Tidak pernah habis"/>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Jumlah Shares</label>
          <input v-model="form.jumlahShares" type="number" class="w-full border rounded p-2"/>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">ROI</label>
          <input v-model="form.roi" type="number" class="w-full border rounded p-2"/>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Value</label>
          <input v-model="form.value" type="number" class="w-full border rounded p-2"/>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Bonus Referral</label>
          <input v-model="form.bonusReferral" type="number" class="w-full border rounded p-2"/>
        </div>
        <div class="flex items-center space-x-2 mt-6">
          <input v-model="form.persen" type="checkbox" class="w-4 h-4"/>
          <label>Persen?</label>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Pairing</label>
          <input v-model="form.pairing" type="number" class="w-full border rounded p-2"/>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Max Pairing</label>
          <input v-model="form.maxPairing" type="number" class="w-full border rounded p-2"/>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Other Matching</label>
          <input v-model="form.otherMatching" type="number" class="w-full border rounded p-2"/>
        </div>
      </div>

      <!-- Checkbox dan Keterangan -->
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <input v-model="form.skipSuspended" type="checkbox" class="w-4 h-4"/>
          <label>Skip Suspended User</label>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Keterangan</label>
          <textarea v-model="form.keterangan" class="w-full border rounded p-2"></textarea>
        </div>
        <div class="flex items-center space-x-2">
          <input v-model="form.suspend" type="checkbox" class="w-4 h-4"/>
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
              <th class="border px-2 py-1 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(m, i) in form.matching" :key="i">
              <td class="border px-2 py-1 bg-gray-100 text-center">{{ i + 1 }}</td>
              <td class="border px-2 py-1">
                <input v-model="m.percentage" type="number" placeholder="Percentage" class="w-full border rounded p-1"/>
              </td>
              <td class="border px-2 py-1 text-center">
                <button type="button" @click="removeMatching(i)" class="text-red-600">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button type="button" @click="addMatching" class="bg-blue-600 text-white px-4 py-2 rounded">
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
              <th class="border px-2 py-1 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rm, i) in form.randomMatching" :key="i">
              <td class="border px-2 py-1 bg-gray-100 text-center">{{ i + 1 }}</td>
              <td class="border px-2 py-1">
                <input v-model="rm.percentage" type="number" placeholder="Percentage" class="w-full border rounded p-1"/>
              </td>
              <td class="border px-2 py-1 text-center">
                <button type="button" @click="removeRandomMatching(i)" class="text-red-600">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="flex items-center space-x-2 mb-3">
          <input v-model="form.includeMatchingRandom" type="checkbox" class="w-4 h-4"/>
          <label>Include Matching Pada Random Matching?</label>
        </div>
        <button type="button" @click="addRandomMatching" class="bg-blue-600 text-white px-4 py-2 rounded">
          + Tambah Level
        </button>
      </div>

      <!-- Submit -->
      <div>
        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded">
          Simpan
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const form = reactive({
  nama: "",
  prioritas: "",
  jumlahHari: "",
  jumlahShares: "",
  roi: "",
  value: "",
  bonusReferral: "",
  persen: false,
  pairing: "",
  maxPairing: "",
  otherMatching: "",
  skipSuspended: false,
  keterangan: "",
  suspend: false,
  matching: [], 
  randomMatching: [],
  includeMatchingRandom: false,
});

function addMatching() {
  form.matching.push({ percentage: "" });
}
function addRandomMatching() {
  form.randomMatching.push({ percentage: "" });
}
function removeMatching(index) {
  form.matching.splice(index, 1);
}
function removeRandomMatching(index) {
  form.randomMatching.splice(index, 1);
}

function submitForm() {
  console.log("Form data:", form);
  alert("Form submitted!");
}
</script>
