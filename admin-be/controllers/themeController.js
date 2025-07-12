const db = require('../models');
const Theme = db.Theme;
const Website = db.Website;

exports.getThemesByWebsite = async (req, res) => {
  const { website_id } = req.query;

  try {
    const themes = await Theme.findAll({
      where: { website_id },
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, themes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
};

exports.getActiveTheme = async (req, res) => {
  try {
    const { website_id } = req.params
    const theme = await Theme.findOne({
      where: {
        website_id,
        is_active: true
      }
    })

    if (!theme) {
      return res.status(404).json({ error: 'No active theme found' })
    }

    res.json({ success: true, theme })
  } catch (error) {
    console.error('Failed to get active theme:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}


exports.createTheme = async (req, res) => {
  try {
    const { name, slug, description, schema, website_id } = req.body;
    const theme = await Theme.create({
      name,
      slug,
      description,
      schema,
      website_id,
      is_active: false
    });
    res.json({ success: true, theme });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTheme = async (req, res) => {
  try {
    const theme = await Theme.findByPk(req.params.id);
    if (!theme) return res.status(404).json({ success: false, message: 'Theme not found' });

    const { name, slug, description, schema } = req.body;
    await theme.update({ name, slug, description, schema });
    res.json({ success: true, theme });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTheme = async (req, res) => {
  try {
    const theme = await Theme.findByPk(req.params.id);
    if (!theme) return res.status(404).json({ success: false, message: 'Theme not found' });

    await theme.destroy();
    res.json({ success: true, message: 'Theme deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setActiveTheme = async (req, res) => {
  const { id } = req.params;

  try {
    const theme = await Theme.findByPk(id);
    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    // Nonaktifkan theme lain pada website yang sama
    await Theme.update(
      { is_active: false },
      { where: { website_id: theme.website_id } }
    );

    // Aktifkan theme ini
    theme.is_active = true;
    await theme.save();

    res.json({ success: true, theme });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to set active theme' });
  }
};
