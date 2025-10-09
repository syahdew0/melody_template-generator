const { sequelize, Order, OrderDetail, HistoryOrderStatus, ProductDetail, ProductVariant, OrderPayment, Post } = require('../../models');
const { getWallet, updateWalletBalance } = require('../../services/walletServices');

module.exports = {
async checkout(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      items,
      shipping_address_id,
      recipient_name,
      recipient_phone,
      latitude,
      longitude,
      use_balance,
      remarks
    } = req.body;

    const customer = req.customer;

    if (!items?.length) {
      await t.rollback();
      return res.status(400).json({ message: 'Tidak ada item dikirim' });
    }

    const productIds = items.map(i => Number(i.product_id)).filter(id => !isNaN(id));
    if (!productIds.length) {
      await t.rollback();
      return res.status(400).json({ message: 'Tidak ada product valid' });
    }

    // Ambil produk dari DB
const dbProducts = await ProductDetail.findAll({
  where: { post_id: productIds },
  transaction: t
});

const productMap = Object.fromEntries(dbProducts.map(p => [p.post_id, p]));


    // Ambil nama post jika ada
    const postIds = dbProducts.map(p => p.post_id).filter(Boolean);
    const posts = await Post.findAll({ where: { id: postIds }, transaction: t });
    const postMap = Object.fromEntries(posts.map(p => [p.id, p.title]));

    const details = [];
    let total_amount = 0;
    const shipping_cost = 30000;

    for (const item of items) {
      const prodId = Number(item.product_id);
      const prod = productMap[prodId];
      if (!prod) {
        await t.rollback();
        return res.status(400).json({ message: `Produk #${prodId} tidak ditemukan` });
      }

      const qty = Number(item.quantity ?? 1);
      if (qty <= 0) {
        await t.rollback();
        return res.status(400).json({ message: `Qty untuk produk #${prodId} tidak valid` });
      }

      let price = 0;
      let variantCombination = null;
      let variantId = null;

      if (item.variant_id) {
        const varId = Number(item.variant_id);
        const variant = await ProductVariant.findByPk(varId, { transaction: t });
        if (!variant) {
          await t.rollback();
          return res.status(400).json({ message: `Varian #${varId} untuk produk #${prodId} tidak ditemukan` });
        }
        if (variant.stock < qty) {
          await t.rollback();
          return res.status(400).json({ message: `Stok varian ${variant.combination} tidak cukup` });
        }

        price = Number(variant.price) || Number(prod.price);
        variantCombination = variant.combination;
        variantId = variant.id;

        variant.stock -= qty;
        await variant.save({ transaction: t });
      } else {
        price = Number(item.price) || 
                (prod.discount_price && prod.discount_until && new Date(prod.discount_until) > new Date()
                  ? Number(prod.discount_price)
                  : Number(prod.price));

        if (prod.stock_integrated === 0 && prod.stock < qty) {
          await t.rollback();
          return res.status(400).json({ message: `Stok produk #${prodId} tidak cukup` });
        }

        if (prod.stock_integrated === 0) {
          prod.stock -= qty;
          await prod.save({ transaction: t });
        }
      }

      const subtotal = price * qty;
      total_amount += subtotal;

      details.push({
        order_id: null,
        product_id: prod.id,
        variant_id: variantId,
        variant_combination: variantCombination,
        product_name: prod.post_id ? postMap[prod.post_id] : prod.name || `Product ${prod.id}`,
        qty,
        price,
        subtotal
      });
    }

    total_amount += shipping_cost;

    const order = await Order.create({
      customer_id: customer.id,
      order_date: new Date(),
      total_amount,
      shipping_cost,
      status: use_balance ? 'Paid' : 'Unpaid',
      shipping_address_id,
      recipient_name,
      recipient_phone,
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      notes: remarks || null
    }, { transaction: t });

    details.forEach(d => d.order_id = order.id);
    await OrderDetail.bulkCreate(details, { transaction: t });

    if (use_balance) {
      const walletData = await getWallet(customer.username, 1);
      if (walletData.balance < total_amount) {
        await t.rollback();
        return res.status(400).json({ message: "Saldo tidak mencukupi" });
      }

      await updateWalletBalance({
        username: customer.username,
        walletTypeId: 1,
        amount: -total_amount,
        transactionTypeId: 11,
        referenceId: order.id,
        remarks: `Pembayaran order #${order.id}`,
        status: 'success',
        createdBy: customer.username
      });

      await OrderPayment.create({
        order_id: order.id,
        amount: total_amount,
        method: 'wallet',
        payment_date: new Date(),
        status: 'Success'
      }, { transaction: t });
    }

    await HistoryOrderStatus.create({
      order_id: order.id,
      status: order.status,
      remarks: remarks || null,
      created_at: new Date()
    }, { transaction: t });

    await t.commit();
    return res.status(201).json({
      message: 'Checkout berhasil',
      order,
      used_balance: use_balance ? total_amount : 0
    });

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
  try {
    const { order_id, payment_method, use_balance } = req.body;
    const customer = req.customer;

    // 🔹 Ambil order
    const order = await Order.findOne({
      where: { id: order_id, customer_id: customer.id },
      include: [OrderDetail],
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    if (order.status !== 'Unpaid') {
      await t.rollback();
      return res.status(400).json({ message: 'Order tidak valid untuk dibayar' });
    }

    const orderDetails = order.OrderDetails;

    // 🔹 Cek stok tiap produk/varian
    for (const d of orderDetails) {
      if (d.variant_id) {
        // jika pakai varian
        const variant = await ProductVariant.findByPk(d.variant_id, { transaction: t });
        if (!variant) {
          await t.rollback();
          return res.status(400).json({ message: `Varian tidak ditemukan untuk produk #${d.product_id}` });
        }
        if (variant.stock < d.qty) {
          await t.rollback();
          return res.status(400).json({ message: `Stok varian ${variant.combination} tidak cukup` });
        }
      } else {
        // produk tanpa varian
        const product = await ProductDetail.findByPk(d.product_id, { transaction: t });
        if (!product) {
          await t.rollback();
          return res.status(400).json({ message: `Produk #${d.product_id} tidak ditemukan` });
        }
        if (product.stock_integrated === 0 && product.stock < d.qty) {
          await t.rollback();
          return res.status(400).json({ message: `Stok produk #${d.product_id} tidak cukup` });
        }
      }
    }

    // 🔹 Kurangi stok
    for (const d of orderDetails) {
      if (d.variant_id) {
        const variant = await ProductVariant.findByPk(d.variant_id, { transaction: t });
        variant.stock -= d.qty;
        if (variant.stock < 0) {
          await t.rollback();
          return res.status(400).json({ message: `Stok varian ${variant.combination} habis` });
        }
        await variant.save({ transaction: t });
      } else {
        const product = await ProductDetail.findByPk(d.product_id, { transaction: t });
        if (product.stock_integrated === 0) {
          product.stock -= d.qty;
          if (product.stock < 0) {
            await t.rollback();
            return res.status(400).json({ message: `Stok produk #${d.product_id} habis` });
          }
          await product.save({ transaction: t });
        }
      }
    }

    // 🔹 Jika pakai saldo wallet
    if (use_balance) {
      const walletData = await getWallet(customer.username, 1); // wallet utama

      if (walletData.balance < order.total_amount) {
        await t.rollback();
        return res.status(400).json({ message: "Saldo tidak mencukupi" });
      }

      // Kurangi saldo
      await updateWalletBalance({
        username: customer.username,
        walletTypeId: 1,
        amount: -order.total_amount,
        transactionTypeId: 11, // order
        referenceId: order.id,
        remarks: `Pembayaran order #${order.id}`,
        status: 'success',
        createdBy: customer.username
      });

      // Catat pembayaran
      await OrderPayment.create({
        order_id: order.id,
        amount: order.total_amount,
        method: 'wallet',
        payment_date: new Date(),
        status: 'Success'
      }, { transaction: t });

      order.status = 'Paid';
      await order.save({ transaction: t });
    } else {
      // 🔹 Jika metode lain (transfer, COD, dll)
      await OrderPayment.create({
        order_id: order.id,
        amount: order.total_amount,
        method: payment_method || 'manual',
        payment_date: new Date(),
        status: 'Pending'
      }, { transaction: t });

      order.status = 'Pending Payment';
      await order.save({ transaction: t });
    }

    // 🔹 Buat History Status
    await HistoryOrderStatus.create({
      order_id: order.id,
      status: order.status,
      created_at: new Date()
    }, { transaction: t });

    await t.commit();

    return res.status(201).json({
      message: 'Pembayaran berhasil',
      used_balance: use_balance ? order.total_amount : 0,
      order
    });

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
