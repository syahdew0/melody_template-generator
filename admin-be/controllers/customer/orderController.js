const { sequelize, Order, OrderDetail, HistoryOrderStatus, ProductDetail, Wallet, OrderPayment } = require('../../models');

module.exports = {
  async checkout(req, res) {
    const t = await sequelize.transaction();
    try {
      const { items, shipping_address_id, recipient_name, recipient_phone, latitude, longitude, use_balance, payment_method,remarks, } = req.body;
      const customer = req.customer;

      if (!items || !items.length) {
        return res.status(400).json({ message: 'Tidak ada item valid' });
      }

      const shipping_cost = 30000;

      // Ambil produk dari DB
      const productIds = items.map(i => i.product_id);
      const dbProducts = await ProductDetail.findAll({
        where: { id: productIds },
        attributes: ['id', 'post_id', 'price', 'discount_price', 'discount_until', 'stock', 'stock_integrated']
      });

      if (!dbProducts.length) return res.status(400).json({ message: 'Produk tidak ditemukan' });

      const productMap = {};
      dbProducts.forEach(p => productMap[p.id] = p);

      // Siapkan order details & hitung total
      const details = [];
      let total_amount = 0;

      for (const item of items) {
        const prod = productMap[item.product_id];
        if (!prod) continue;

        const qty = item.qty > 0 ? item.qty : 1;
        if (prod.stock_integrated === 0 && prod.stock < qty) {
          return res.status(400).json({ message: `Stock tidak cukup untuk product ${prod.id}` });
        }

        let price = item.price;
        if (prod.discount_price && prod.discount_until && new Date(prod.discount_until) > new Date()) {
          price = Number(prod.price) - Number(prod.discount_price);
        }

        const subtotal = qty * price;
        total_amount += subtotal;

        details.push({
          product_id: prod.id,
          product_name: prod.post_id ? `Product ${prod.post_id}` : `Product ${prod.id}`,
          qty,
          price,
          subtotal
        });
      }

      if (!details.length) return res.status(400).json({ message: 'Tidak ada produk valid untuk checkout' });

      total_amount += shipping_cost;

      // Ambil atau buat wallet customer
      let wallet = await Wallet.findOne({ where: { customer_id: customer.id } });
      if (!wallet) {
        wallet = await Wallet.create({ customer_id: customer.id, balance: 0 }, { transaction: t });
      }

      // Tentukan status order dan update wallet jika pakai saldo
      let orderStatus = 'Unpaid';
      if (use_balance && wallet.balance >= total_amount) {
        wallet.balance -= total_amount;
        await wallet.save({ transaction: t });
        orderStatus = 'Paid';
      }

      // Buat Order
      const order = await Order.create({
        customer_id: customer.id,
        order_date: new Date(),
        total_amount,
        shipping_cost,
        status: orderStatus,
        shipping_address_id,
        recipient_name,
        recipient_phone,
        latitude,
        longitude,
        notes: remarks || null,
      }, { transaction: t });

      // Assign order_id ke details & buat OrderDetail
      details.forEach(d => d.order_id = order.id);
      await OrderDetail.bulkCreate(details, { transaction: t });

      // Kurangi stock
      for (const d of details) {
        const product = await ProductDetail.findByPk(d.product_id, { transaction: t });
        if (product.stock_integrated === 0) {
          product.stock -= d.qty;
          await product.save({ transaction: t });
        }
      }

      // Buat HistoryOrderStatus
      await HistoryOrderStatus.create({
        order_id: order.id,
        status: orderStatus,
        remarks: remarks || null,
        created_at: new Date()
      }, { transaction: t });

      await t.commit();
      return res.status(201).json({ message: 'Checkout berhasil', order, used_balance: use_balance ? total_amount : 0 });

    } catch (err) {
      await t.rollback();
      console.error('Checkout error:', err);
      return res.status(500).json({ message: 'Checkout gagal', error: err.message });
    }
  },

  async pay(req, res) {
    const t = await sequelize.transaction();
    try {
      const { order_id, payment_method } = req.body;
      const customer = req.customer;

      const order = await Order.findOne({ where: { id: order_id, customer_id: customer.id }, transaction: t });
      if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
      if (order.status !== 'Unpaid') return res.status(400).json({ message: 'Order tidak valid untuk dibayar' });

      // Ambil detail order
      const orderDetails = await OrderDetail.findAll({ where: { order_id }, transaction: t });

      // Cek stock sebelum bayar
      for (const d of orderDetails) {
        const product = await ProductDetail.findByPk(d.product_id, { transaction: t });
        if (product.stock_integrated === 0 && product.stock < d.qty) {
          return res.status(400).json({ message: `Stock tidak cukup untuk product ${product.id}` });
        }
      }

      // Kurangi stock saat bayar
      for (const d of orderDetails) {
        const product = await ProductDetail.findByPk(d.product_id, { transaction: t });
        if (product.stock_integrated === 0) {
          product.stock -= d.qty;
          await product.save({ transaction: t });
        }
      }

      // Buat OrderPayment
      await OrderPayment.create({
        order_id,
        amount: order.total_amount,
        payment_method,
        payment_date: new Date()
      }, { transaction: t });

      // Update status order
      await Order.update({ status: 'Paid' }, { where: { id: order_id }, transaction: t });

      // Buat HistoryOrderStatus
      await HistoryOrderStatus.create({
        order_id,
        status: 'Paid',
        created_at: new Date()
      }, { transaction: t });

      await t.commit();
      res.status(201).json({ message: 'Pembayaran berhasil' });

    } catch (err) {
      await t.rollback();
      console.error('Pay error:', err);
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
      console.error('MyOrders error:', err);
      res.status(500).json({ message: 'Gagal ambil order', error: err.message });
    }
  }
};
