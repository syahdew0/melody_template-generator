const { ContactInfo } = require('../models');

// controllers/heroHomeController.js
exports.getAll = async (req, res) => {
    try {
      const all = await HeroHome.findAll({
        order: [['createdAt', 'DESC']], // Urutkan terbaru ke atas
      })
      res.json(all)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

exports.getContactInfo = async (req, res) => {
    try {
      const data = await ContactInfo.findOne({ order: [['id', 'DESC']] });
  
      let parsedItems = [];
  
      if (data?.items) {
        try {
          parsedItems = typeof data.items === 'string'
            ? JSON.parse(data.items)
            : data.items;
        } catch (err) {
          console.error(' Error parsing items:', err);
        }
      }
  
      res.json({
        contactInfo: {
          id: data?.id || null,
          title: data?.title || 'Kontak Kami',
          items: parsedItems
        }
      });
    } catch (error) {
      console.error('Gagal ambil data contactInfo:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  exports.updateContactInfo = async (req, res) => {
    const { contactInfo } = req.body;
  
    try {
      const items = Array.isArray(contactInfo.items) ? contactInfo.items : [];
  
      let existing = await ContactInfo.findOne();
  
      if (existing) {
        await existing.update({
          title: contactInfo.title,
          items: JSON.stringify(items),
          address: contactInfo.address || existing.address,
          phone: contactInfo.phone || existing.phone,
          email: contactInfo.email || existing.email
        });
        res.json({ message: 'Berhasil diupdate', contactInfo: existing });
      } else {
        const newData = await ContactInfo.create({
          title: contactInfo.title,
          items: JSON.stringify(items),
          address: contactInfo.address || '', // 👈 Berikan nilai default jika perlu
          phone: contactInfo.phone || '',
          email: contactInfo.email || ''
        });
        res.json({ message: 'Berhasil dibuat', contactInfo: newData });
      }
    } catch (error) {
      console.error('Gagal update contactInfo:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
