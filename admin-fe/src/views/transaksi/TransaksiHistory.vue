<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Wallet Saya</h1>

    <div class="mb-6">
      <h2 class="text-xl font-semibold">Saldo: Rp{{ formatRupiah(wallet.balance) }}</h2>
    </div>

    <section class="mb-8">
      <h3 class="font-semibold mb-2">Riwayat Topup</h3>
      <ul>
        <li v-for="t in topups" :key="t.id" class="border-b py-1">
          Rp{{ formatRupiah(t.amount) }} - {{ t.status }} - {{ formatDate(t.createdon) }}
        </li>
      </ul>
    </section>

    <section class="mb-8">
      <h3 class="font-semibold mb-2">Riwayat Withdraw</h3>
      <ul>
        <li v-for="w in withdraws" :key="w.id" class="border-b py-1">
          Rp{{ formatRupiah(w.amount) }} - {{ w.status }} - {{ formatDate(w.createdon) }}
        </li>
      </ul>
    </section>

    <section>
      <h3 class="font-semibold mb-2">Riwayat Adjust</h3>
      <ul>
        <li v-for="a in adjusts" :key="a.id" class="border-b py-1">
          {{ a.type === 'in' ? '+' : '-' }} Rp{{ formatRupiah(a.amount) }} - {{ formatDate(a.createdon) }} - {{ a.remarks || '-' }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

const wallet = ref({ balance: 0 })
const topups = ref([])
const withdraws = ref([])
const adjusts = ref([])

const fetchWallet = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.adjust.walletMe)
    wallet.value = res.data.wallet || { balance: 0 }
  } catch (error) {
    console.error('Gagal ambil wallet:', error)
  }
}

const fetchTopups = async () => {
  try {
    const res = await axios.get(`${API_ENDPOINTS.topup}?status=success`) 
    topups.value = res.data || []
  } catch (error) {
    console.error('Gagal ambil topup:', error)
  }
}

const fetchWithdraws = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.withdraw.list('success'))
    withdraws.value = res.data || []
  } catch (error) {
    console.error('Gagal ambil withdraw:', error)
  }
}

const fetchAdjusts = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.adjust.list)
    adjusts.value = res.data || []
  } catch (error) {
    console.error('Gagal ambil adjust:', error)
  }
}

const formatRupiah = (val) => Number(val).toLocaleString('id-ID')
const formatDate = (val) => new Date(val).toLocaleString('id-ID')

onMounted(() => {
  fetchWallet()
  fetchTopups()
  fetchWithdraws()
  fetchAdjusts()
})
</script>
