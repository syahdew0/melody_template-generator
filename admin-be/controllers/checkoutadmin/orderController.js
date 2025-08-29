const { 
Order, Customer, CustomerAddress, OrderDetail, ProductDetail, HistoryOrderStatus, WalletHistory,Wallet, Post } = require('../../models');
const { sequelize } = require('../../models');
const { Op } = require('sequelize');

module.exports = {
  // List semua order (untuk admin)
async listOrders(req, res) {
    try {
      const orders = await Order.findAll({ order: [['id', 'DESC']] });
      const orderIds = orders.map(o => o.id);
      const customerIds = orders.map(o => o.customer_id);
      const addressIds = orders.map(o => o.shipping_address_id).filter(Boolean);

      // Ambil data terkait (paralel)
      const [customers, addresses, orderDetails, history] = await Promise.all([
        Customer.findAll({ where: { id: { [Op.in]: customerIds } } }),
        CustomerAddress.findAll({ where: { id: { [Op.in]: addressIds } } }),
        OrderDetail.findAll({ where: { order_id: { [Op.in]: orderIds } } }),
        HistoryOrderStatus.findAll({ 
          where: { order_id: { [Op.in]: orderIds } }, 
          order: [['created_at', 'DESC']] 
        }),
      ]);

      // Map customer & address
      const customerMap = Object.fromEntries(customers.map(c => [c.id, c.toJSON()]));
      const addressMap = Object.fromEntries(addresses.map(a => [a.id, a.toJSON()]));

      // Ambil productDetail + post
      const productDetailIds = [...new Set(orderDetails.map(d => d.product_id))];
      const productDetails = await ProductDetail.findAll({ where: { id: { [Op.in]: productDetailIds } } });
      const postIds = productDetails.map(pd => pd.post_id).filter(Boolean);
      const posts = await Post.findAll({ where: { id: { [Op.in]: postIds } } });

      const productDetailMap = Object.fromEntries(productDetails.map(pd => [pd.id, pd.toJSON()]));
      const postMap = Object.fromEntries(posts.map(p => [p.id, p.toJSON()]));

      // === Perbaikan utama: define orderDetailMap di awal ===
      const orderDetailMap = {};

      orderDetails.forEach(d => {
        if (!orderDetailMap[d.order_id]) orderDetailMap[d.order_id] = [];

        const pd = productDetailMap[d.product_id] || null;
        const post = pd?.post_id ? postMap[pd.post_id] : null;

        let productName;
        if (post?.title) productName = post.title;
        else if (pd?.name) productName = pd.name;
        else if (d.product_name && !/^\d+$/.test(d.product_name)) productName = d.product_name;
        else productName = `Product ${d.product_id}`;

        orderDetailMap[d.order_id].push({
          product_name: productName,
          qty: d.qty,
          price: d.price,
          subtotal: d.subtotal,
        });
      });

      // Mapping history per order
      const historyMap = {};
      history.forEach(h => {
        if (!historyMap[h.order_id]) historyMap[h.order_id] = [];
        historyMap[h.order_id].push({
          status: h.status,
          remarks: h.remarks || '-',
          created_at: h.created_at
        });
      });

      // Hasil akhir
      const results = orders.map(order => {
        const address = addressMap[order.shipping_address_id] || null;
        const customer = customerMap[order.customer_id] || null;

        return {
          ...order.toJSON(),
          shipping_cost: order.shipping_cost,
          customer: customer
            ? {
                name: customer.name || customer.username || '-',
                username: customer.username || '-',
                email: customer.email || '-',
                phone: customer.phone || '-',
              }
            : { name: '-', username: '-', email: '-', phone: '-' },
          shipping_address: address
            ? {
                recipient_name: address.recipient_name,
                phone: address.phone,
                address: address.address,
                district_name: address.district_name,
                city_name: address.city_name,
                province_name: address.province_name,
                postal_code: address.postal_code,
              }
            : null,
          details: orderDetailMap[order.id] || [],
          statusHistory: historyMap[order.id] || [],
          remarks: historyMap[order.id]?.[0]?.remarks || order.notes || '-',
        };
      });

      res.json(results);
    } catch (err) {
      console.error('listOrders error:', err);
      res.status(500).json({ error: 'Internal Server Error', detail: err.message });
    }
  },

  // Detail order admin
// Detail order admin
async orderDetail(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

    const customer = await Customer.findByPk(order.customer_id);

    let address = null;
    if (order.shipping_address_id) {
      address = await CustomerAddress.findByPk(order.shipping_address_id);
    } else if (customer) {
      address = await CustomerAddress.findOne({
        where: { customer_id: customer.id, is_default: true }
      });
    }

    // Ambil semua order detail
    const details = await OrderDetail.findAll({ where: { order_id: id } });
    const productDetailIds = [...new Set(details.map(d => d.product_id))];

    const productDetails = await ProductDetail.findAll({ where: { id: { [Op.in]: productDetailIds } } });
    const postIds = productDetails.map(pd => pd.post_id).filter(Boolean);
    const posts = await Post.findAll({ where: { id: { [Op.in]: postIds } } });

    const productDetailMap = Object.fromEntries(productDetails.map(pd => [pd.id, pd.toJSON()]));
    const postMap = Object.fromEntries(posts.map(p => [p.id, p.toJSON()]));

    // Susun detail dengan nama produk
    const detailData = details.map(d => {
      const pd = productDetailMap[d.product_id];
      const post = pd ? postMap[pd.post_id] : null;

      let productName;
      if (post?.title) {
        productName = post.title;
      } else if (pd?.name) {
        productName = pd.name;
      } else if (d.product_name && !/^\d+$/.test(d.product_name)) {
        productName = d.product_name;
      } else {
        productName = `Product ${d.product_id}`;
      }

      return {
        product_name: productName,
        qty: d.qty || 0,
        price: d.price || 0,
        subtotal: d.subtotal || (d.price * d.qty) || 0,
      };
    });

    const history = await HistoryOrderStatus.findAll({
      where: { order_id: id },
      order: [['created_at', 'DESC']]
    });

    res.json({
      ...order.toJSON(),
      shipping_cost: order.shipping_cost || 30000,
      customer: customer
        ? {
            name: customer.name || customer.username || '-',
            username: customer.username || '-',
            email: customer.email || '-',
            phone: customer.phone || '-',
          }
        : { name: '-', username: '-', email: '-', phone: '-' },
      shipping_address: address
        ? {
            recipient_name: address.recipient_name || '-',
            phone: address.phone || '-',
            address: address.address || '-',
            district_name: address.district_name || address.district || '-',
            city_name: address.city_name || address.city || '-',
            province_name: address.province_name || address.province || '-',
            postal_code: address.postal_code || '-',
          }
        : {
            recipient_name: '-',
            phone: '-',
            address: '-',
            district_name: '-',
            city_name: '-',
            province_name: '-',
            postal_code: '-',
          },
      details: detailData,
      statusHistory: history.map(h => ({
        status: h.status,
        remarks: h.remarks || '-',
        created_at: h.created_at
      })),
      remarks: history.length ? history[0].remarks || '-' : order.notes || '-',
      payment_method: order.payment_method || '-',
    });
  } catch (err) {
    console.error('orderDetail error:', err);
    res.status(500).json({ message: 'Gagal ambil detail order', error: err.message });
  }
},

// Update status order
async updateStatus(req, res) {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    // Ambil order
    const order = await Order.findByPk(id, { transaction: t });
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

    // Ambil customer
    const customer = await Customer.findByPk(order.customer_id, { transaction: t });
    if (!customer) return res.status(404).json({ message: 'Customer tidak ditemukan' });

    // Ambil wallet customer (buat otomatis kalau belum ada)
    let wallet = await Wallet.findOne({ 
      where: { customer_id: customer.id, wallet_type: 'saldo' },
      transaction: t 
    });

    if (!wallet) {
      wallet = await Wallet.create({
        customer_id: customer.id,
        wallet_type: 'saldo',
        balance: 0
      }, { transaction: t });
    }

    // Ambil wallet history terakhir
    const lastWalletHistory = await WalletHistory.findOne({
      where: { walletId: wallet.id },
      order: [['created_at', 'DESC']],
      transaction: t
    });

    const amount = Number(order.total_amount ?? 0);
    const balanceBefore = Number(lastWalletHistory?.balance_after ?? wallet.balance ?? 0);
    let balanceAfter = balanceBefore;

    const refundableStatuses = ['Unpaid', 'Cancel', 'Refund'];

    // ====== LOGIKA BARU ======
    if (refundableStatuses.includes(status)) {
      // hanya refund kalau status sebelumnya bukan refundable
      if (!refundableStatuses.includes(order.status)) {
        balanceAfter = balanceBefore + amount;
        wallet.balance = balanceAfter;
        await wallet.save({ transaction: t });

        await WalletHistory.create({
          walletId: wallet.id,
          username: customer.username ?? 'unknown',
          transaction_type_id: 13, // order_dibatalkan
          wallet_type: 'saldo',
          reference_id: order.id,
          balance_before: balanceBefore,
          amount: amount,
          balance_after: balanceAfter,
          remarks: `Refund order #${order.id}`,
          status: 'success',
          created_at: new Date()
        }, { transaction: t });
      }
    } else if (status === 'Paid') {
      // kalau dari refund → balik ke paid, potong saldo
      if (refundableStatuses.includes(order.status)) {
        balanceAfter = balanceBefore - amount;
        if (balanceAfter < 0) {
          await t.rollback();
          return res.status(400).json({ message: 'Saldo tidak mencukupi untuk mengembalikan ke Paid' });
        }

        wallet.balance = balanceAfter;
        await wallet.save({ transaction: t });

        await WalletHistory.create({
          walletId: wallet.id,
          username: customer.username ?? 'unknown',
          transaction_type_id: 11, // bisa bikin type baru: order_dibayar
          wallet_type: 'saldo',
          reference_id: order.id,
          balance_before: balanceBefore,
          amount: -amount,
          balance_after: balanceAfter,
          remarks: ` order #${order.id} dibayar`,
          status: 'success',
          created_at: new Date()
        }, { transaction: t });
      }
    }

    // Update status order
    await order.update({ status }, { transaction: t });

    // Simpan history status order
    await HistoryOrderStatus.create({
      order_id: order.id,
      status,
      remarks: remarks || '-',
      created_at: new Date(),
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Status order berhasil diperbarui', order });
  } catch (err) {
    await t.rollback();
    console.error('updateStatus error:', err);
    res.status(500).json({ message: 'Gagal update status', error: err.message });
  }
},
};