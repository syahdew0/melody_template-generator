const { Order, OrderDetail, OrderPayment, HistoryOrderStatus } = require('../../models');

module.exports = {
  async checkout(req, res) {
    try {
      const { items } = req.body;
      const customer = req.customer;

      if (!items || !items.length)
        return res.status(400).json({ message: 'Data tidak lengkap' });

      const total_amount = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

      const order = await Order.create({
        customer_id: customer.id,
        order_date: new Date(),
        total_amount,
        status: 'Unpaid'
      });

      const details = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        qty: item.qty,
        price: item.price,
        subtotal: item.qty * item.price
      }));

      await OrderDetail.bulkCreate(details);

      await HistoryOrderStatus.create({
        order_id: order.id,
        status: 'Unpaid',
        changed_at: new Date()
      });

      res.status(201).json({ message: 'Checkout berhasil', order });
    } catch (err) {
      res.status(500).json({ message: 'Checkout gagal', error: err.message });
    }
  },

  async pay(req, res) {
    try {
      const { order_id, amount, payment_method } = req.body;
      const customer = req.customer;

      const order = await Order.findOne({ where: { id: order_id, customer_id: customer.id } });
      if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

      await OrderPayment.create({
        order_id,
        amount,
        payment_method,
        payment_date: new Date()
      });

      await Order.update({ status: 'Paid' }, { where: { id: order_id } });

      await HistoryOrderStatus.create({
        order_id,
        status: 'Paid',
        changed_at: new Date()
      });

      res.status(201).json({ message: 'Pembayaran berhasil' });
    } catch (err) {
      res.status(500).json({ message: 'Gagal membayar', error: err.message });
    }
  },

  async myOrders(req, res) {
    try {
      const customer = req.customer;
      const orders = await Order.findAll({
        where: { customer_id: customer.id },
        include: [OrderDetail, OrderPayment, HistoryOrderStatus]
      });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: 'Gagal ambil order', error: err.message });
    }
  }
};
