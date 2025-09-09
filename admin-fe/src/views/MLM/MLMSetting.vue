<template>
  <div class="p-8 max-w-full mx-auto">
    <h1 class="text-2xl font-bold mb-6">Pengaturan MLM</h1>

    <!-- Tombol Set Suspend -->
    <button
      class="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
      @click="setSuspend"
    >
      Set Suspend
    </button>

    <!-- General Settings -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label class="block font-semibold mb-1">Max Hari Transaksi</label>
        <input
          type="number"
          v-model="form.maxHariTransaksi"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label class="block font-semibold mb-1">Max iklan per hari</label>
        <input
          type="text"
          v-model="form.maxIklanPerHari"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <div class="flex items-center space-x-2">
        <input type="checkbox" v-model="form.autoApprove" id="autoApprove" />
        <label for="autoApprove">Auto Approve Paket User?</label>
      </div>

      <div class="flex items-center space-x-2">
        <input type="checkbox" v-model="form.samePackage" id="samePackage" />
        <label for="samePackage">Bisa beli paket yang sama</label>
      </div>

      <div>
        <label class="block font-semibold mb-1">Max Child</label>
        <input
          type="number"
          v-model="form.maxChild"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <div class="flex items-center space-x-2">
        <input type="checkbox" v-model="form.autoHold" id="autoHold" />
        <label for="autoHold">Auto Hold Transaksi yg dilaporkan?</label>
      </div>
    </div>

    <!-- Position Name -->
    <h2 class="text-lg font-bold mb-2">Position Name</h2>
    <table class="w-full border mb-6">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-4 py-2 text-left">Position Name</th>
          <th class="border px-4 py-2 text-left">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(pos, index) in form.positions" :key="index">
          <td class="border px-4 py-2">
            <input
              type="text"
              v-model="pos.name"
              class="w-full border rounded px-2 py-1"
            />
          </td>
          <td class="border px-4 py-2">
            <input
              type="number"
              v-model="pos.value"
              class="w-full border rounded px-2 py-1"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Wallet Settings -->
    <h2 class="text-lg font-bold mb-2">Wallet yg dipakai dalam pembagian</h2>
    <table class="w-full border mb-6">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-4 py-2 text-left">Wallet</th>
          <th class="border px-4 py-2 text-left">Percent</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(wallet, index) in form.wallets" :key="index">
          <td class="border px-4 py-2 flex items-center space-x-2">
            <input type="checkbox" v-model="wallet.active" />
            <span>{{ wallet.name }}</span>
          </td>
          <td class="border px-4 py-2">
            <input
              type="number"
              v-model="wallet.percent"
              class="w-full border rounded px-2 py-1"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Simpan -->
    <button
  class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
  @click="saveSettings"
>
  Simpan
</button>

  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import axios from "axios";
import { API_ENDPOINTS } from "@/config/api";

const form = reactive({
  maxHariTransaksi: 2,
  maxIklanPerHari: "",
  autoApprove: false,
  samePackage: false,
  autoHold: false,
  maxChild: 4,
  positions: [
    { name: "Left", value: 10 },
    { name: "Mid 1", value: 20 },
    { name: "Mid 2", value: 30 },
    { name: "Right", value: 40 },
  ],
  wallets: [
    { name: "MLM BALANCE", percent: 30, active: true },
    { name: "MLM WD", percent: 70, active: true },
  ],
});

const loadSettings = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.mlmSettings, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.data) {
      Object.assign(form, res.data); // update reactive form dengan data backend
    }
  } catch (err) {
    console.error("Gagal load pengaturan MLM:", err);
  }
};

const saveSettings = async () => {
  try {
    await axios.put(API_ENDPOINTS.mlmSettings, form, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    alert("Pengaturan berhasil disimpan!");
  } catch (err) {
    console.error("Gagal simpan pengaturan MLM:", err);
    alert("Terjadi kesalahan saat menyimpan.");
  }
};

const setSuspend = () => {
  alert("Suspend set!"); // nanti bisa diganti dengan request API
};

onMounted(loadSettings);
</script>
