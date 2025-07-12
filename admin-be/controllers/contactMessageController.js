const { ContactMessage } = require('../models');

exports.submitMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const saved = await ContactMessage.create({ name, email, phone, subject, message });
    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menyimpan pesan' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil pesan' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const id = req.params.id;
    await ContactMessage.destroy({ where: { id } });
    res.json({ message: 'Pesan dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus pesan' });
  }
};
