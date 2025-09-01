const { Comment, Setting } = require('../models');

module.exports = {
  // CREATE comment (mengikuti setting global)
  async create(req, res) {
    try {
      const { post_id, content, username, email } = req.body;

      const setting = await Setting.findOne({ where: { key: 'auto_approve_comments' } });
      const autoApprove = setting?.value === 'true';

      const comment = await Comment.create({
        post_id,
        content,
        username,
        email,
        approved: autoApprove,
      });

      res.json(comment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal membuat komentar' });
    }
  },

  // GET comments by post slug
  async getByPostSlug(req, res) {
    try {
      const { slug } = req.params;
      const comments = await Comment.findAll({
        include: [{ association: 'post', where: { slug }, attributes: [] }],
        order: [['created_at', 'DESC']],
      });
      res.json(comments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal memuat komentar' });
    }
  },

  // LIST all comments (admin)
  async listAll(req, res) {
    try {
      const comments = await Comment.findAll({
        include: [{ association: 'post', attributes: ['title', 'slug'] }],
        order: [['created_at', 'DESC']],
      });
      res.json(comments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal memuat komentar' });
    }
  },

  // UPDATE status approve/reject
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { approved } = req.body;
      const comment = await Comment.findByPk(id);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });

      comment.approved = approved;
      await comment.save();
      res.json(comment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal memperbarui status komentar' });
    }
  },

  // GET comment detail
 async getDetail(req, res) {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id, {
      include: [{ association: 'post', attributes: ['title', 'slug'] }]
    });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // pastikan approved tetap ada
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memuat detail komentar' });
  }
},

  /**
   * GLOBAL SETTINGS
   */

  // GET auto-approve setting
  async getAutoApproveSetting(req, res) {
    try {
      const setting = await Setting.findOne({ where: { key: 'auto_approve_comments' } });
      res.json({ value: setting?.value === 'true' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengambil setting auto-approve' });
    }
  },

  // PATCH update auto-approve setting
  async updateAutoApproveSetting(req, res) {
    try {
      const { value } = req.body; // boolean
      let setting = await Setting.findOne({ where: { key: 'auto_approve_comments' } });

      if (!setting) {
        setting = await Setting.create({
          key: 'auto_approve_comments',
          value: value ? 'true' : 'false',
        });
      } else {
        setting.value = value ? 'true' : 'false';
        await setting.save();
      }

      res.json({ success: true, value });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal memperbarui setting auto-approve' });
    }
  },
};
