const { sequelize, Order, OrderDetail, OrderPayment, HistoryOrderStatus, Product } = require('../../models');

module.exports = {
  async checkout(req, res) {
    const t = await sequelize.transaction();
    try {
      const { items } = req.body;
      const customer = req.customer;

      if (!items || !items.length)
        return res.status(400).json({ message: 'Data tidak lengkap' });

      // Ambil harga produk dari DB
      const productIds = items.map(i => i.product_id);
      const dbProducts = await Product.findAll({ where: { id: productIds } });

      if (dbProducts.length !== productIds.length) {
        return res.status(400).json({ message: 'Ada produk tidak valid' });
      }

      const details = [];
      let total_amount = 0;

      for (const item of items) {
        const prod = dbProducts.find(p => p.id === item.product_id);
        if (!prod) continue;

        const qty = item.qty > 0 ? item.qty : 1;
        const price = prod.price;
        const subtotal = qty * price;
        total_amount += subtotal;

        details.push({
          order_id: null,
          product_id: prod.id,
          product_name: prod.title,
          qty,
          price,
          subtotal
        });
      }

      // Buat order
      const order = await Order.create({
        customer_id: customer.id,
        order_date: new Date(),
        total_amount,
        status: 'Unpaid'
      }, { transaction: t });

      details.forEach(d => d.order_id = order.id);

      await OrderDetail.bulkCreate(details, { transaction: t });

      await HistoryOrderStatus.create({
        order_id: order.id,
        status: 'Unpaid',
        changed_at: new Date()
      }, { transaction: t });

      await t.commit();
      res.status(201).json({ message: 'Checkout berhasil', order });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ message: 'Checkout gagal', error: err.message });
    }
  },

  async pay(req, res) {
    const t = await sequelize.transaction();
    try {
      const { order_id, payment_method } = req.body;
      const customer = req.customer;

      const order = await Order.findOne({ where: { id: order_id, customer_id: customer.id } });

      if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
      if (order.status !== 'Unpaid') {
        return res.status(400).json({ message: 'Order tidak valid untuk dibayar' });
      }

      const amount = order.total_amount;

      await OrderPayment.create({
        order_id,
        amount,
        payment_method,
        payment_date: new Date()
      }, { transaction: t });

      await Order.update({ status: 'Paid' }, { where: { id: order_id }, transaction: t });

      await HistoryOrderStatus.create({
        order_id,
        status: 'Paid',
        changed_at: new Date()
      }, { transaction: t });

      await t.commit();
      res.status(201).json({ message: 'Pembayaran berhasil' });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ message: 'Gagal membayar', error: err.message });
    }
  },

  async myOrders(req, res) {
    try {
      const customer = req.customer;
      const orders = await Order.findAll({
        where: { customer_id: customer.id },
        include: [OrderDetail, OrderPayment, HistoryOrderStatus],
        order: [['order_date', 'DESC']]
      });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: 'Gagal ambil order', error: err.message });
    }
  }
};
