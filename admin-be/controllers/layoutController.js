exports.getLayoutBySite = async (req, res) => {
    const { siteId } = req.params;
    try {
      const contents = await Content.findAll({ where: { siteId } });
      res.json(contents);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.updateLayout = async (req, res) => {
    const { siteId } = req.params;
    const updates = req.body;
    try {
      await Promise.all(updates.map(async ({ key, value }) => {
        const [content, created] = await Content.findOrCreate({
          where: { siteId, key },
          defaults: { value }
        });
        if (!created) {
          content.value = value;
          await content.save();
        }
      }));
      res.json({ message: 'Layout updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  