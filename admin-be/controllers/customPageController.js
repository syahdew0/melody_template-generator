const { CustomPage } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const where = {};

    if (req.query.tag) {
      where.tag = req.query.tag;
    }

    if (req.query.parent_id === 'null') {
      where.parent_id = null;
    } else if (req.query.parent_id) {
      where.parent_id = req.query.parent_id;
    }

    const data = await CustomPage.findAll({ where });

    // Parse items if necessary
    const parsedData = data.map(item => {
      let parsedItems = null;
      try {
        parsedItems = typeof item.items === 'string' ? JSON.parse(item.items) : item.items;
      } catch (err) {
        console.warn(` Gagal parsing items untuk ID ${item.id}`);
      }

      return {
        ...item.toJSON(),
        items: parsedItems,
      };
    });

    res.json(parsedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const body = { ...req.body };

    if (body.items && typeof body.items === 'object') {
      body.items = JSON.stringify(body.items);
    }

    const newContent = await CustomPage.create(body);
    res.status(201).json(newContent);
  } catch (error) {
    console.error('CREATE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET BY ID
exports.getById = async (req, res) => {
  try {
    const content = await CustomPage.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Custom Page not found' });
    }

    let parsedItems = null;
    try {
      parsedItems = typeof content.items === 'string' ? JSON.parse(content.items) : content.items;
    } catch (err) {
      console.warn(' Gagal parsing items di GET BY ID:', err.message);
    }

    res.json({
      ...content.toJSON(),
      items: parsedItems,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };

    if (body.items && typeof body.items === 'object') {
      body.items = JSON.stringify(body.items)
    }    

    // console.log(' Incoming Update Payload:', body);

    const [updated] = await CustomPage.update(body, { where: { id } });

    if (updated === 0) {
      return res.status(404).json({ message: 'Custom Page not found' });
    }

    const updatedContent = await CustomPage.findByPk(id);
    let parsedItems = null;
    try {
      parsedItems = typeof updatedContent.items === 'string'
        ? JSON.parse(updatedContent.items)
        : updatedContent.items;
    } catch (err) {
      console.warn(' Gagal parsing items di UPDATE:', err.message);
    }

    res.status(200).json({
      ...updatedContent.toJSON(),
      items: parsedItems,
    });
  } catch (err) {
    console.error(' Update Failed:', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const deleted = await CustomPage.destroy({ where: { id: req.params.id } });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Custom Page not found' });
    }

    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteByTag = async (req, res) => {
  try {
    const { tag } = req.params  // ← ini yang benar
    if (!tag) return res.status(400).json({ message: 'Tag is required' })

    const deleted = await CustomPage.destroy({ where: { tag } })

    if (deleted === 0) {
      return res.status(404).json({ message: `Tag "${tag}" tidak ditemukan.` })
    }

    res.json({ message: `Tag "${tag}" berhasil dihapus.` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menghapus tag.' })
  }
}

exports.getByPage = async (req, res) => {
  try {
    const page = req.query.page;
    const theme_id = req.query.theme_id;

    if (!page) return res.status(400).json({ message: 'Page is required' });

    const where = {
      page: page
    };
    
    if (theme_id !== undefined) {
      where.theme_id = theme_id;
    }
    

    const items = await CustomPage.findAll({ where });

    const result = {};

    items.forEach(item => {
      const tagParts = item.tag.split('-');
      const key = tagParts.slice(1).join('-'); 

      let parsed;
      try {
        parsed = typeof item.items === 'string' ? JSON.parse(item.items) : item.items;
      } catch (e) {
        console.warn(` Gagal parse items untuk ${item.tag}:`, e.message);
        return;
      }
      if (result[key]) {
       
        if (!Array.isArray(result[key])) {
          result[key] = [result[key]];
        }
        result[key].push(parsed);
      } else {
        result[key] = parsed;
      }
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error(' Gagal load custom page:', err);
    res.status(500).json({ message: 'Server error' });
  }
};