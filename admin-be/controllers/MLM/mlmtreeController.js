// controllers/MLM/mlmtreeController.js
const { MlmRegistration, Customer, MLMPackage } = require('../../models');

//Helper untuk hitung jumlah downline (rekursif)
function countDownline(users, parentId) {
  const children = users.filter(u => u.upline_id === parentId);
  let count = children.length;
  for (const child of children) {
    count += countDownline(users, child.customer_id);
  }
  return count;
}

//Helper rekursif untuk membangun tree (tetap sama, hanya tambah field total_downline)
function buildTree(users, parentId) {
  return users
    .filter(u => u.upline_id === parentId)
    .map(u => ({
      id: u.customer_id,
      username: u.username,
      package: u.package || '',
      placement_pos: u.placement_pos,
      total_downline: countDownline(users, u.customer_id), 
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
    { model: Customer, as: 'Customer', attributes: ['id', 'username', 'referral'] },
    { model: MLMPackage, as: 'package', attributes: ['MLMPackageName'] },
  ]
});

    // Mapping ke array sederhana
    const users = registrations.map(r => ({
      customer_id: r.customer_id,
      username: r.Customer?.username || 'Unknown',
      package: r.package?.MLMPackageName || '',
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
      total_downline: countDownline(users, rootId), 
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
