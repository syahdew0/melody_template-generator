// controllers/MLM/mlmtreeController.js
const { MlmRegistration, Customer, MLMPackage } = require('../../models');

// Helper rekursif untuk membangun tree
function buildTree(users, parentId) {
  return users
    .filter(u => u.upline_id === parentId)
    .map(u => ({
      id: u.customer_id,
      username: u.username,
      package: u.package || '',
      placement_pos: u.placement_pos,
      availablePositions: ['left', 'right'].filter(
        pos => !users.some(c => c.upline_id === parentId && c.placement_pos === pos)
      ),
      children: buildTree(users, u.customer_id)
    }));
}

exports.getTree = async (req, res) => {
  try {
    // Ambil rootId dari query, fallback ke login user
    const rootId = req.query.rootId ? parseInt(req.query.rootId) : req.customer.id;

    // Ambil semua registrasi aktif beserta data customer dan paket
    const registrations = await MlmRegistration.findAll({
      where: { status: 'active' },
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'username', 'referral'] },
        { model: MLMPackage, as: 'package', attributes: ['MLMPackageName'] },
      ]
    });

    // Mapping ke array sederhana
    const users = registrations.map(r => ({
      customer_id: r.customer_id,
      username: r.customer.username,
      package: r.package ? r.package.MLMPackageName : '',
      upline_id: r.upline_id,
      placement_pos: r.placement_pos
    }));

    // Cari data root
    const rootReg = users.find(u => u.customer_id === rootId);

    if (!rootReg) {
      return res.status(404).json({ success: false, message: 'Root user tidak ditemukan' });
    }

    const tree = [{
      id: rootReg.customer_id,
      username: rootReg.username,
      package: rootReg.package || '',
      placement_pos: rootReg.placement_pos || 'root',
      availablePositions: ['left', 'right'].filter(
        pos => !users.some(u => u.upline_id === rootId && u.placement_pos === pos)
      ),
      children: buildTree(users, rootId)
    }];

    res.json({ success: true, data: tree });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memuat MLM tree', error: err.message });
  }
};
