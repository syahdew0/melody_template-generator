const { Customer, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.getAllCustomers = async (req, res) => {
  try {
    const { fromDate, toDate, username, bank, no_rekening, nama_rekening } = req.query;

    const where = {};

    if (username) {
      where.username = { [Op.like]: `%${username}%` };
    }

    if (bank) {
      where.bank = { [Op.like]: `%${bank}%` };
    }

    if (no_rekening) {
      where.no_rekening = { [Op.like]: `%${no_rekening}%` };
    }

    if (nama_rekening) {
      where.nama_rekening = { [Op.like]: `%${nama_rekening}%` };
    }

    if (fromDate && toDate) {
      where.createdAt = {
        [Op.between]: [new Date(fromDate + 'T00:00:00'), new Date(toDate + 'T23:59:59')],
      };
    } else if (fromDate) {
      where.createdAt = { [Op.gte]: new Date(fromDate + 'T00:00:00') };
    } else if (toDate) {
      where.createdAt = { [Op.lte]: new Date(toDate + 'T23:59:59') };
    }

    const customers = await Customer.findAll({
      where,
      attributes: [
        'id', 'username', 'email', 'createdAt',
        'bank', 'no_rekening', 'nama_rekening'
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data customer', error: error.message });
  }
};
