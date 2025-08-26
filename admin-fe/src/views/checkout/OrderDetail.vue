<template>
  <div class="p-6">
    <!-- Header & Back -->
    <div class="flex items-center justify-between mb-4">
      <button @click="$router.back()" class="flex items-center text-blue-600 hover:underline">
        ← Kembali
      </button>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="text-gray-500">Memuat detail...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- Order Detail -->
    <div v-else-if="order" class="space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <h1 class="text-2xl font-bold">Detail Order #{{ order.id }}</h1>
        <span class="px-3 py-1 rounded text-sm" :class="badgeClass(order.status)">
          {{ order.status || 'Unpaid' }}
        </span>
      </div>

      <!-- Info Ringkas & Update Status -->
      <div class="grid md:grid-cols-2 gap-4">
        <!-- Informasi Order -->
        <div class="border rounded p-4">
          <h2 class="font-semibold mb-3">Informasi Order</h2>
          <p><strong>Customer:</strong> {{ order.customer?.name || order.customer_id }}</p>
          <p><strong>Tanggal:</strong> {{ formatDate(order.order_date) }}</p>
          <p><strong>Total Produk:</strong> Rp {{ formatCurrency(totalProducts) }}</p>
          <p><strong>Ongkos Kirim:</strong> Rp {{ formatCurrency(order.shipping_cost || 0) }}</p>
         <p><strong>Grand Total:</strong> Rp {{ formatCurrency((order.total_amount || 0) + (order.shipping_cost || 0)) }}</p>


          <p><strong>Metode Pembayaran:</strong> {{ order.payment_method || '-' }}</p>
          <p><strong>Catatan Customer:</strong> {{ order.notes || '-' }}</p>

          <!-- Alamat -->
          <div v-if="order.shipping_address" class="mt-3">
            <h3 class="font-semibold">Alamat Pengiriman</h3>
            <p>{{ order.shipping_address.recipient_name }} — {{ order.shipping_address.phone }}</p>
            <p>{{ order.shipping_address.address }}</p>
            <p>
              {{ order.shipping_address.district_name }},
              {{ order.shipping_address.city_name }},
              {{ order.shipping_address.province_name }}
              {{ order.shipping_address.postal_code }}
            </p>
          </div>
        </div>

        <!-- Form Update Status -->
        <div class="border rounded p-4">
          <h2 class="font-semibold mb-3">Update Status</h2>
          <div class="space-y-3">
            <div>
              <label class="block text-sm mb-1">Status Order</label>
              <select v-model="statusForm.status" class="border rounded w-full px-3 py-2">
                <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm mb-1">Remarks</label>
              <textarea v-model="statusForm.remarks" rows="3" class="border rounded w-full px-3 py-2"
                placeholder="Catatan untuk history..."></textarea>
            </div>
            <div class="flex gap-2">
              <button
                @click="submitStatus"
                :disabled="saving"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              >
                Simpan Status
              </button>
            </div>
            <p v-if="saveError" class="text-red-600 text-sm">{{ saveError }}</p>
            <p v-if="saveSuccess" class="text-green-700 text-sm">{{ saveSuccess }}</p>
          </div>
        </div>
      </div>

      <!-- Cetak Resi -->
      <div class="flex justify-end mb-4">
        <button
          @click="printReceipt"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Cetak Resi
        </button>
      </div>

      <!-- Div Resi -->
      <div id="receipt" class="hidden">
        <div style="max-width:400px; margin:auto; font-family:Arial, sans-serif; font-size:14px; padding:10px; border:1px solid #000;">
          <h2 style="text-align:center; margin-bottom:10px;">RESI PEMESANAN</h2>
          <p><strong>Order #:</strong> {{ order.id }}</p>
          <p><strong>Customer:</strong> {{ order.customer?.name || order.customer_id }}</p>
          <p><strong>Tanggal:</strong> {{ formatDate(order.order_date) }}</p>
          <p><strong>Status:</strong> {{ order.status || 'Unpaid' }}</p>
          <p><strong>Total Produk:</strong> Rp {{ formatCurrency(order.total_amount) }}</p>
          <p><strong>Ongkos Kirim:</strong> Rp {{ formatCurrency(order.shipping_cost || 0) }}</p>
          <p><strong>Grand Total:</strong> Rp {{ formatCurrency((order.total_amount || 0) + (order.shipping_cost || 0)) }}</p>
          <hr style="margin:10px 0;">
          <h3>Produk</h3>
          <table style="width:100%; border-collapse: collapse; margin-bottom:10px;">
            <thead>
              <tr>
                <th style="border-bottom:1px solid #000; text-align:left;">Produk</th>
                <th style="border-bottom:1px solid #000;">Qty</th>
                <th style="border-bottom:1px solid #000;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, i) in order.details || []" :key="i">
                <td>{{ d.product_name }}</td>
                <td style="text-align:center;">{{ d.qty }}</td>
                <td style="text-align:right;">Rp {{ formatCurrency(d.subtotal) }}</td>
              </tr>
            </tbody>
          </table>
          <hr style="margin:10px 0;">
          <div v-if="order.shipping_address">
            <h3>Alamat Pengiriman</h3>
            <p>{{ order.shipping_address.recipient_name }} — {{ order.shipping_address.phone }}</p>
            <p>{{ order.shipping_address.address }}</p>
            <p>
              {{ order.shipping_address.district_name }},
              {{ order.shipping_address.city_name }},
              {{ order.shipping_address.province_name }}
              {{ order.shipping_address.postal_code }}
            </p>
          </div>
          <hr style="margin:10px 0;">
          <p style="text-align:center;">Terima kasih atas pesanan Anda!</p>
        </div>
      </div>

      <!-- Detail Produk -->
      <div class="border rounded p-4">
        <h2 class="font-semibold mb-3">Detail Produk</h2>
        <table class="min-w-full border">
          <thead>
            <tr class="bg-gray-100 text-left">
              <th class="px-4 py-2 border">Produk</th>
              <th class="px-4 py-2 border">Qty</th>
              <th class="px-4 py-2 border">Harga</th>
              <th class="px-4 py-2 border">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, index) in (order.details || [])" :key="index" class="hover:bg-gray-50">
              <td class="px-4 py-2 border">{{ d.product_name }}</td>
              <td class="px-4 py-2 border">{{ d.qty }}</td>
              <td class="px-4 py-2 border">Rp {{ formatCurrency(d.price) }}</td>
              <td class="px-4 py-2 border">Rp {{ formatCurrency(d.subtotal) }}</td>
            </tr>
            <!-- Ongkir & Grand Total -->
            <tr>
              <td colspan="3" class="px-4 py-2 border font-semibold text-right">Ongkos Kirim</td>
              <td class="px-4 py-2 border font-semibold">Rp {{ formatCurrency(order.shipping_cost || 0) }}</td>
            </tr>
            <tr>
              <td colspan="3" class="px-4 py-2 border font-bold text-right">Grand Total</td>
              <td class="px-4 py-2 border font-bold">Rp {{ formatCurrency((order.total_amount || 0) + (order.shipping_cost || 0)) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!order.details || order.details.length===0" class="text-gray-500 py-3">Tidak ada item.</div>
      </div>

      <!-- History Status -->
      <div class="border rounded p-4">
        <h2 class="font-semibold mb-3">History Status</h2>
        <ul class="space-y-1" v-if="order.statusHistory && order.statusHistory.length">
          <li v-for="(h, idx) in order.statusHistory" :key="idx" class="text-sm">
            {{ formatDate(h.created_at) }} — <strong>{{ h.status }}</strong>
            <span v-if="h.remarks"> — {{ h.remarks }}</span>
          </li>
        </ul>
        <div v-else class="text-gray-500">Belum ada history.</div>
      </div>
    </div>

    <div v-else class="text-gray-500">Data tidak ditemukan.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { API_ENDPOINTS, api } from '@/config/api'

const route = useRoute()
const order = ref(null)
const loading = ref(false)
const error = ref('')

const statuses = ['Unpaid', 'Paid', 'Cancel', 'Refund', 'Payment Expired']
const statusForm = ref({ status: 'Unpaid', remarks: '' })
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref('')

// Hitung total produk & grand total dari order.details
const totalProducts = computed(() =>
  order.value?.details?.reduce((sum, d) => sum + (d.subtotal ?? d.price * d.qty), 0) || 0
)
// const grandTotal = computed(() =>
//   totalProducts.value + (order.value?.shipping_cost || 0)
// )

const fetchOrder = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get(API_ENDPOINTS.orders.detail(route.params.id))
    order.value = data
    statusForm.value.status = data.status || 'Unpaid'
    statusForm.value.remarks = ''
  } catch (e) {
    console.error(e)
    error.value = 'Gagal memuat detail order.'
  } finally {
    loading.value = false
  }
}

const submitStatus = async () => {
  if (!order.value) return
  saveError.value = ''
  saveSuccess.value = ''
  saving.value = true
  try {
    await api.put(API_ENDPOINTS.orders.updateStatus(order.value.id), {
      status: statusForm.value.status,
      remarks: statusForm.value.remarks || null
    })
    saveSuccess.value = 'Status berhasil diperbarui.'
    await fetchOrder()
  } catch (e) {
    console.error(e)
    saveError.value = e?.response?.data?.message || 'Gagal memperbarui status.'
  } finally {
    saving.value = false
  }
}

const formatCurrency = (val) => {
  const rounded = Math.round(val || 0); // bulatkan ke integer terdekat
  return new Intl.NumberFormat('id-ID').format(rounded)
}

const formatDate = (d) => (d ? new Date(d).toLocaleString('id-ID') : '-')
const badgeClass = (status) => {
  const s = status || 'Unpaid'
  if (s === 'Paid') return 'bg-green-100 text-green-700'
  if (s === 'Unpaid') return 'bg-yellow-100 text-yellow-700'
  if (s === 'Cancel') return 'bg-gray-200 text-gray-700'
  if (s === 'Refund') return 'bg-purple-100 text-purple-700'
  return 'bg-red-100 text-red-700'
}

onMounted(fetchOrder)
</script>
