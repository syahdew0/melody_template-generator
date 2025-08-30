const { sequelize, Order, OrderDetail, HistoryOrderStatus, ProductDetail, OrderPayment, WalletHistory, Post } = require('../../models');
const { getWallet, updateWalletBalance } = require('../../services/walletServices');

module.exports = {
async checkout(req, res) {
    const t = await sequelize.transaction();
    try {
      const { items, shipping_address_id, recipient_name, recipient_phone, use_balance, remarks } = req.body;
      const customer = req.customer;

      if (!items?.length) return res.status(400).json({ message: 'Tidak ada item valid' });

      const shipping_cost = 30000;

      // Ambil produk dari DB
      const productIds = items.map(i => i.product_id);
      const dbProducts = await ProductDetail.findAll({ where: { id: productIds }, transaction: t });
      const productMap = Object.fromEntries(dbProducts.map(p => [p.id, p]));

      // Ambil post title
      const postIds = dbProducts.map(p => p.post_id).filter(Boolean);
      const posts = await Post.findAll({ where: { id: postIds }, transaction: t });
      const postMap = Object.fromEntries(posts.map(p => [p.id, p.title]));

      // Hitung detail order & total_amount
      const details = [];
      let total_amount = 0;
      for (const item of items) {
        const prod = productMap[item.product_id];
        if (!prod) continue;

        const qty = item.qty > 0 ? item.qty : 1;
        if (prod.stock_integrated === 0 && prod.stock < qty) {
          await t.rollback();
          return res.status(400).json({ message: `Stock tidak cukup untuk product ${prod.id}` });
        }

        const price = (prod.discount_price && prod.discount_until && new Date(prod.discount_until) > new Date())
          ? prod.discount_price
          : prod.price;

        const subtotal = price * qty;
        total_amount += subtotal;

        details.push({
          product_id: prod.id,
          product_name: prod.post_id ? postMap[prod.post_id] : `Product ${prod.id}`,
          qty,
          price,
          subtotal
        });
      }
      total_amount += shipping_cost;

      // Buat order
      const order = await Order.create({
        customer_id: customer.id,
        order_date: new Date(),
        total_amount,
        shipping_cost,
        status: 'Unpaid',
        shipping_address_id,
        recipient_name,
        recipient_phone,
        notes: remarks || null,
      }, { transaction: t });

      // Kurangi stock
      for (const d of details) {
        const product = productMap[d.product_id];
        if (product.stock_integrated === 0) {
          product.stock -= d.qty;
          if (product.stock < 0) throw new Error(`Stock tidak cukup untuk product ${product.id}`);
          await product.save({ transaction: t });
        }
      }

      // Jika pakai saldo wallet
      if (use_balance) {
        // Ambil saldo terakhir dari WalletHistory
        const walletData = await getWallet(customer.username, 1); // 1 = wallet_type_id "saldo"

        if (walletData.balance < total_amount) {
          await t.rollback();
          return res.status(400).json({ message: "Saldo tidak mencukupi" });
        }

        // Kurangi saldo dan buat WalletHistory baru
        await updateWalletBalance({
          username: customer.username,
          walletTypeId: 1,
          amount: -total_amount,
          transactionTypeId: 11, // order
          referenceId: order.id,
          remarks: `Pembayaran order #${order.id}`,
          status: 'success',
          createdBy: customer.username
        });

        // Buat OrderPayment
        await OrderPayment.create({
          order_id: order.id,
          amount: total_amount,
          method: 'wallet',
          payment_date: new Date(),
          status: 'Success'
        }, { transaction: t });

        // Update status order
        order.status = 'Paid';
        await order.save({ transaction: t });
      }

      // Buat OrderDetail
      details.forEach(d => d.order_id = order.id);
      await OrderDetail.bulkCreate(details, { transaction: t });

      // History order
      await HistoryOrderStatus.create({
        order_id: order.id,
        status: order.status,
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

  async myOrders(req, res) {
    try {
      const customer = req.customer;
      const orders = await Order.findAll({
        where: { customer_id: customer.id },
        include: [OrderDetail, OrderPayment, HistoryOrderStatus],
        order: [['order_date', 'DESC']]
      });

      // mapping product_name
      const productIds = orders.flatMap(o => o.OrderDetails.map(d => d.product_id));
      const productDetails = await ProductDetail.findAll({ where: { id: productIds } });
      const postIds = productDetails.map(p => p.post_id);
      const posts = await Post.findAll({ where: { id: postIds } });
      const postMap = Object.fromEntries(posts.map(p => [p.id, p.title]));
      const productMap = Object.fromEntries(productDetails.map(pd => [pd.id, pd]));

      const ordersWithNames = orders.map(order => {
        const details = order.OrderDetails.map(d => {
          const pd = productMap[d.product_id];
          const postTitle = pd?.post_id ? postMap[pd.post_id] : null;
          return {
            ...d.toJSON(),
            product_name: d.product_name || postTitle || `Product ${d.product_id}`
          };
        });
        return {
          ...order.toJSON(),
          OrderDetails: details
        };
      });

      res.json(ordersWithNames);

    } catch (err) {
      console.error('MyOrders error:', err);
      res.status(500).json({ message: 'Gagal ambil order', error: err.message });
    }
  },
async pay(req, res) {
  const t = await sequelize.transaction();
  console.log('Kurangi stock:', product.id, 'sebelum:', product.stock, 'qty:', d.qty);
  try {
    const { order_id, payment_method, use_balance } = req.body;
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

    // Kurangi stock
    for (const d of orderDetails) {
      const product = await ProductDetail.findByPk(d.product_id, { transaction: t });
      if (product.stock_integrated === 0) {
        product.stock -= d.qty;
        if (product.stock < 0) {
          await t.rollback();
          return res.status(400).json({ message: `Stock tidak cukup untuk product ${product.id}` });
        }
        await product.save({ transaction: t });
      }
    }

    // Jika pakai saldo wallet
    if (use_balance) {
      let wallet = await Wallet.findOne({ where: { customer_id: customer.id }, transaction: t });
      if (!wallet) return res.status(404).json({ message: "Wallet tidak ditemukan" });
      wallet.balance = Number(wallet.balance) || 0;

      if (wallet.balance < order.total_amount) {
        return res.status(400).json({ message: "Saldo tidak mencukupi" });
      }

      const balanceBefore = wallet.balance;
      wallet.balance -= order.total_amount;
      await wallet.save({ transaction: t });

      // Catat WalletHistory negatif
      await WalletHistory.create({
        walletId: wallet.id,
        username: customer.username,
        transaction_type_id: 11, // order
        wallet_type: 'saldo',
        reference_id: order.id,
        balance_before: balanceBefore,
        amount: -order.total_amount,
        balance_after: wallet.balance,
        remarks: `Pembayaran order #${order.id}`,
        status: 'success',
        created_at: new Date()
      }, { transaction: t });
    }

    // Buat OrderPayment
    await OrderPayment.create({
      order_id,
      amount: order.total_amount,
      payment_method,
      payment_date: new Date(),
      status: 'Success'
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
    res.status(201).json({ message: 'Pembayaran berhasil', used_balance: use_balance ? order.total_amount : 0 });

  } catch (err) {
    await t.rollback();
    console.error('Pay error:', err);
    res.status(500).json({ message: 'Gagal membayar', error: err.message });
  }
},

async checkoutWithSaldo(req, res) {
  const t = await sequelize.transaction();
  try {
    const { customerId, orderId, orderTotal } = req.body;

    // 1. Ambil wallet customer
    let wallet = await Wallet.findOne({ where: { customer_id: customerId }, transaction: t });
    if (!wallet) return res.status(404).json({ message: "Wallet tidak ditemukan" });

    wallet.balance = Number(wallet.balance) || 0;

    // 2. Cek saldo cukup
    if (wallet.balance < orderTotal) {
      return res.status(400).json({ message: "Saldo tidak mencukupi" });
    }

    // 3. Hitung saldo baru
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - orderTotal;

    // 4. Update wallet
    wallet.balance = balanceAfter;
    await wallet.save({ transaction: t });

    // 5. Update status order
    await Order.update({ status: 'Paid' }, { where: { id: orderId }, transaction: t });

    // 6. Simpan wallet history (amount negatif)
    await WalletHistory.create({
      walletId: wallet.id,
      username: wallet.username || 'unknown',
      transaction_type_id: 11, // order
      wallet_type: 'saldo',
      reference_id: orderId,
      balance_before: balanceBefore,
      amount: -orderTotal, // negative karena pengurangan
      balance_after: balanceAfter,
      remarks: `Pembayaran order #${orderId}`,
      status: 'success',
      created_at: new Date()
    }, { transaction: t });

    await t.commit();
    return res.json({ message: "Checkout sukses dengan saldo", balance: wallet.balance });

  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}
  
};
