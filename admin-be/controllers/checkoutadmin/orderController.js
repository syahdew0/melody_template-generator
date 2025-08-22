const { 
  Order, Customer, CustomerAddress, OrderDetail, ProductDetail, HistoryOrderStatus, Post 
} = require('../../models');
const { sequelize } = require('../../models');

module.exports = {
  // List semua order (untuk admin)
  async listOrders(req, res) {
    try {
      const orders = await Order.findAll({ order: [['id', 'DESC']] });
      const orderIds = orders.map(o => o.id);
      const customerIds = orders.map(o => o.customer_id);
      const addressIds = orders.map(o => o.shipping_address_id);

      const [customers, addresses, orderDetails, history] = await Promise.all([
        Customer.findAll({ where: { id: customerIds } }),
        CustomerAddress.findAll({ where: { id: addressIds } }),
        OrderDetail.findAll({ where: { order_id: orderIds } }),
        HistoryOrderStatus.findAll({ where: { order_id: orderIds }, order: [['created_at', 'DESC']] }),
      ]);

      // Mapping cepat
      const customerMap = Object.fromEntries(customers.map(c => [c.id, c.toJSON()]));
      const addressMap = Object.fromEntries(addresses.map(a => [a.id, a.toJSON()]));

      // Ambil semua productDetail + post
      const productDetailIds = orderDetails.map(d => d.product_detail_id);
      const productDetails = await ProductDetail.findAll({ where: { id: productDetailIds } });
      const postIds = productDetails.map(pd => pd.post_id);
      const posts = await Post.findAll({ where: { id: postIds } });

      const productDetailMap = Object.fromEntries(productDetails.map(pd => [pd.id, pd.toJSON()]));
      const postMap = Object.fromEntries(posts.map(p => [p.id, p.toJSON()]));

      // Mapping detail
      const orderDetailMap = {};
      orderDetails.forEach(d => {
        if (!orderDetailMap[d.order_id]) orderDetailMap[d.order_id] = [];
        const pd = productDetailMap[d.product_detail_id];
        const post = pd ? postMap[pd.post_id] : null;
        orderDetailMap[d.order_id].push({
          product_name: d.product_name || (post ? post.title : `Product ${d.product_detail_id}`),
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
        return {
          ...order.toJSON(),
          customer: customerMap[order.customer_id] || null,
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

  // Detail order berdasarkan ID
async orderDetail(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

    // Ambil customer
    const customer = await Customer.findByPk(order.customer_id);

    // Ambil alamat: prioritas shipping_address_id, kalau null ambil default customer
    let address = null;
    if (order.shipping_address_id) {
      address = await CustomerAddress.findByPk(order.shipping_address_id);
    } else if (customer) {
      address = await CustomerAddress.findOne({
        where: { customer_id: customer.id, is_default: true }
      });
    }

    // Ambil detail order
    const details = await OrderDetail.findAll({ where: { order_id: id } });

    // Ambil produk + post
    const productDetailIds = details.map(d => d.product_detail_id);
    const productDetails = await ProductDetail.findAll({ where: { id: productDetailIds } });
    const postIds = productDetails.map(pd => pd.post_id);
    const posts = await Post.findAll({ where: { id: postIds } });

    const productDetailMap = Object.fromEntries(productDetails.map(pd => [pd.id, pd.toJSON()]));
    const postMap = Object.fromEntries(posts.map(p => [p.id, p.toJSON()]));

    const detailData = details.map(d => {
      const pd = productDetailMap[d.product_detail_id];
      const post = pd ? postMap[pd.post_id] : null;
      return {
        product_name: d.product_name || (post ? post.title : `Product ${d.product_detail_id}`),
        qty: d.qty,
        price: d.price,
        subtotal: d.subtotal,
      };
    });

    // Ambil history status
    const history = await HistoryOrderStatus.findAll({
      where: { order_id: id },
      order: [['created_at', 'DESC']]
    });

    res.json({
      ...order.toJSON(),
      customer: customer ? customer.toJSON() : null,
      shipping_address: address
        ? {
            recipient_name: address.recipient_name,
            phone: address.phone,
            address: address.address,
            district_name: address.district_name || address.district,
            city_name: address.city_name || address.city,
            province_name: address.province_name || address.province,
            postal_code: address.postal_code,
          }
        : null,
      details: detailData,
      statusHistory: history.map(h => ({
        status: h.status,
        remarks: h.remarks || '-',
        created_at: h.created_at
      })),
      remarks: history.length ? history[0].remarks || '-' : order.notes || '-',
    });

  } catch (err) {
    console.error('orderDetail error:', err);
    res.status(500).json({ message: 'Gagal ambil detail order', error: err.message });
  }
}
,

  // Update status order
  async updateStatus(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;

      const order = await Order.findByPk(id, { transaction: t });
      if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

      await order.update({ status }, { transaction: t });

      await HistoryOrderStatus.create({
        order_id: order.id,
        status,
        remarks: remarks || null,
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
