<template>
  <div class="order-list">
    <h2>Daftar Order</h2>
    <table border="1" cellpadding="8" cellspacing="0" width="100%">
      <thead>
        <tr>
          <th>ID</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Status</th>
          <th>Tanggal</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>{{ order.id }}</td>
          <td>{{ order.customer_name }}</td>
          <td>Rp {{ order.total_amount.toLocaleString() }}</td>
          <td>{{ order.status }}</td>
          <td>{{ new Date(order.order_date).toLocaleString() }}</td>
          <td>
            <router-link :to="`/checkout/orders/${order.id}`">Detail</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "OrderList",
  data() {
    return {
      orders: [],
    };
  },
  async created() {
    try {
      const res = await axios.get("http://localhost:3001/api/orders");
      this.orders = res.data;
    } catch (err) {
      console.error("Gagal ambil daftar order:", err);
    }
  },
};
</script>
