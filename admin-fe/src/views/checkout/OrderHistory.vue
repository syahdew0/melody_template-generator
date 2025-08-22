<template>
  <div class="p-6">
    <!-- Header & Filter -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Riwayat Order</h1>

      <div class="flex gap-2">
        <select v-model="filters.status" class="border rounded px-3 py-2">
          <option value="">Semua Status</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
        <button @click="fetchOrders" class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
          Filter
        </button>
        <button @click="resetFilters" class="px-4 py-2 border rounded hover:bg-gray-50">
          Reset
        </button>
      </div>
    </div>

    <!-- Loading & Error -->
    <div v-if="loading" class="text-gray-500">Memuat data...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- Tabel Orders -->
    <div v-else>
      <table class="min-w-full border text-sm">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="px-4 py-2 border">ID</th>
            <th class="px-4 py-2 border">Customer</th>
            <th class="px-4 py-2 border">Produk</th>
            <!-- <th class="px-4 py-2 border">Alamat</th> -->
            <th class="px-4 py-2 border">Tanggal</th>
            <th class="px-4 py-2 border">Pembayaran</th>
            <th class="px-4 py-2 border">Total</th>
            <th class="px-4 py-2 border">Remarks</th>
            <th class="px-4 py-2 border">Status</th>
            <th class="px-4 py-2 border">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.id" class="hover:bg-gray-50 align-top">
            <!-- ID -->
            <td class="px-4 py-2 border">{{ o.id }}</td>

            <!-- Customer -->
            <td class="px-4 py-2 border">
              {{ o.customer?.username || '-' }}<br />
              <span class="text-gray-500 text-xs">{{ o.customer?.name || '-' }}</span>
            </td>

            <!-- Produk -->
            <td class="px-4 py-2 border">
              <ul>
                <li v-for="d in o.details" :key="d.id">
                  {{ d.product_name }} (x{{ d.qty }})
                  <span class="text-gray-500 text-xs">
                    Rp {{ formatCurrency(d.price) }}
                  </span>
                </li>
              </ul>
            </td>

            <!-- Alamat -->
            <!-- <td class="px-4 py-2 border">
              <div v-if="o.shipping_address">
                {{ o.shipping_address.recipient_name }} - {{ o.shipping_address.phone }}<br />
                <span class="text-gray-500 text-xs">
                  {{ o.shipping_address.address }},
                  {{ o.shipping_address.district }},
                  {{ o.shipping_address.city }},
                  {{ o.shipping_address.province }},
                  {{ o.shipping_address.postal_code }}
                </span>
              </div>
              <span v-else>-</span>
            </td> -->

            <!-- Tanggal -->
            <td class="px-4 py-2 border">{{ formatDate(o.order_date) }}</td>

            <!-- Pembayaran -->
            <td class="px-4 py-2 border">{{ o.payment_method || '-' }}</td>

            <!-- Total -->
            <td class="px-4 py-2 border">Rp {{ formatCurrency(o.total_amount) }}</td>

            <!-- Remarks -->
            <td class="px-4 py-2 border text-xs">{{ o.remarks || '-' }}</td>

            <!-- Status -->
            <td class="px-4 py-2 border">
              <span class="px-2 py-1 text-xs rounded" :class="badgeClass(o.status)">
                {{ o.status || 'Unpaid' }}
              </span>
            </td>

            <!-- Aksi -->
            <td class="px-4 py-2 border flex gap-2">
              <button
                @click="goDetail(o.id)"
                class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Detail
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Tidak ada data -->
      <div v-if="orders.length === 0" class="text-gray-500 py-6 text-center">
        Tidak ada data.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { API_ENDPOINTS, api } from '@/config/api'

const router = useRouter()
const orders = ref([])
const loading = ref(false)
const error = ref('')
const statuses = ['Unpaid', 'Paid', 'Cancel', 'Refund', 'Payment Expired']
const filters = ref({ status: '' })

// Fetch orders
const fetchOrders = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get(API_ENDPOINTS.orders.list)
    orders.value = filters.value.status
      ? data.filter(o => (o.status || 'Unpaid') === filters.value.status)
      : data
  } catch (e) {
    console.error(e)
    error.value = 'Gagal memuat orders.'
  } finally {
    loading.value = false
  }
}

// Reset filter
const resetFilters = () => {
  filters.value.status = ''
  fetchOrders()
}

// Navigate to order detail
const goDetail = (id) => {
  router.push({ name: 'OrderDetail', params: { id } })
}

// Format currency & date
const formatCurrency = (val) => new Intl.NumberFormat('id-ID').format(val || 0)
const formatDate = (d) => (d ? new Date(d).toLocaleString('id-ID') : '-')

// Badge status
const badgeClass = (status) => {
  const s = status || 'Unpaid'
  if (s === 'Paid') return 'bg-green-100 text-green-700'
  if (s === 'Unpaid') return 'bg-yellow-100 text-yellow-700'
  if (s === 'Cancel') return 'bg-gray-200 text-gray-700'
  if (s === 'Refund') return 'bg-purple-100 text-purple-700'
  return 'bg-red-100 text-red-700'
}

onMounted(fetchOrders)
onActivated(fetchOrders)
</script>
