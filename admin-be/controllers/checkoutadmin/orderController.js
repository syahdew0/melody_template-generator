const { Order, OrderDetail, OrderPayment, HistoryOrderStatus } = require('../../models');

module.exports = {
  async getAll(req, res) {
    try {
      const orders = await Order.findAll({
        include: [OrderDetail, OrderPayment, HistoryOrderStatus],
        order: [['order_date', 'DESC']]
      });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: 'Gagal ambil orders', error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id, {
        include: [OrderDetail, OrderPayment, HistoryOrderStatus]
      });
      if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: 'Gagal ambil order', error: err.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { order_id } = req.params;
      const { status } = req.body;

      const order = await Order.findByPk(order_id);
      if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

      await Order.update({ status }, { where: { id: order_id } });

      const history = await HistoryOrderStatus.create({
        order_id,
        status,
        changed_at: new Date()
      });

      res.json({ message: 'Status diperbarui', history });
    } catch (err) {
      res.status(500).json({ message: 'Gagal update status', error: err.message });
    }
  }
};
