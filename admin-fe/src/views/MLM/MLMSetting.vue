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
      <!-- matching -->
      <div class="flex items-center space-x-2">
        <input type="checkbox" v-model="form.matchingFromUpline" id="matchingFromUpline" />
        <label for="matchingFromUpline">Ambil Matching Bonus dari Paket Upline?</label>
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
  maxHariTransaksi: 0,
  maxIklanPerHari: "",
  autoApprove: false,
  samePackage: false,
  autoHold: false,
  maxChild: 0,
  positions: [],
  wallets: [],
   matchingFromUpline: false,
});

// Load pengaturan dari backend
const loadSettings = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.mlmSettings, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.data) {
      let data = res.data;

      // Pastikan positions array
      if (data.Positions) {
        form.positions = Array.isArray(data.Positions)
          ? data.Positions
          : JSON.parse(data.Positions);
      } else if (data.positions) {
        form.positions = Array.isArray(data.positions)
          ? data.positions
          : JSON.parse(data.positions);
      } else {
        form.positions = [];
      }

      // Wallets
      if (data.Wallets) {
        form.wallets = Array.isArray(data.Wallets)
          ? data.Wallets
          : JSON.parse(data.Wallets);
      } else if (data.wallets) {
        form.wallets = Array.isArray(data.wallets)
          ? data.wallets
          : JSON.parse(data.wallets);
      } else {
        form.wallets = [];
      }

      // Field lainnya
      form.maxHariTransaksi = data.MaxHariTransaksi ?? 2;
      form.maxIklanPerHari = data.MaxIklanPerHari ?? "";
      form.autoApprove = !!data.AutoApprove;
      form.samePackage = !!data.SamePackage;
      form.autoHold = !!data.AutoHold;
      form.maxChild = data.MaxChild ?? 4;
      form.matchingFromUpline = data.BonusSource === "upline";
    }
  } catch (err) {
    console.error("Gagal load pengaturan MLM:", err);
  }
};

// Simpan pengaturan ke backend
const saveSettings = async () => {
  try {
    const payload = {
      MaxHariTransaksi: form.maxHariTransaksi,
      MaxIklanPerHari: form.maxIklanPerHari,
      AutoApprove: form.autoApprove ? 1 : 0,
      SamePackage: form.samePackage ? 1 : 0,
      AutoHold: form.autoHold ? 1 : 0,
      MaxChild: form.maxChild,
      positions: form.positions,
      wallets: form.wallets,
      BonusSource: form.matchingFromUpline ? "upline" : "downline",
    };

    await axios.put(API_ENDPOINTS.mlmSettings, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    alert("Pengaturan berhasil disimpan!");
  } catch (err) {
    console.error("Gagal simpan pengaturan MLM:", err);
    alert("Terjadi kesalahan saat menyimpan.");
  }
};

// Tombol dummy untuk suspend
const setSuspend = () => {
  alert("Suspend set!");
};

onMounted(loadSettings);
</script>
