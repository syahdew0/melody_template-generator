<template>
  <div class="order-detail">
    <h2>Detail Order #{{ order.id }}</h2>

    <div v-if="order.customer_name">
      <p><b>Customer:</b> {{ order.customer_name }}</p>
      <p><b>Status:</b> {{ order.status }}</p>
      <p><b>Tanggal:</b> {{ new Date(order.order_date).toLocaleString() }}</p>
      <p><b>Total:</b> Rp {{ order.total_amount.toLocaleString() }}</p>
    </div>

    <h3>Produk</h3>
    <table border="1" cellpadding="8" cellspacing="0" width="100%">
      <thead>
        <tr>
          <th>Nama Produk</th>
          <th>Qty</th>
          <th>Harga</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in order.details" :key="item.id">
          <td>{{ item.product_name }}</td>
          <td>{{ item.qty }}</td>
          <td>Rp {{ item.price.toLocaleString() }}</td>
          <td>Rp {{ item.subtotal.toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>

    <h3>Ubah Status</h3>
    <select v-model="newStatus">
      <option>Unpaid</option>
      <option>Paid</option>
      <option>Shipped</option>
      <option>Completed</option>
      <option>Cancelled</option>
    </select>
    <button @click="updateStatus">Update</button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "OrderDetail",
  data() {
    return {
      order: {},
      newStatus: "",
    };
  },
  async created() {
    const id = this.$route.params.id;
    try {
      const res = await axios.get(`http://localhost:3001/api/orders/${id}`);
      this.order = res.data;
      this.newStatus = res.data.status;
    } catch (err) {
      console.error("Gagal ambil detail order:", err);
    }
  },
  methods: {
    async updateStatus() {
      try {
        await axios.put(
          `http://localhost:3001/api/orders/${this.order.id}/status`,
          { status: this.newStatus }
        );
        alert("Status berhasil diupdate");
      } catch (err) {
        console.error("Gagal update status:", err);
      }
    },
  },
};
</script>
