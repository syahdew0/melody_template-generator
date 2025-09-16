const { MlmRegistration, Customer, MLMPackage } = require('../../models');

async function buildTree(customerId, depth = 3) {
  if (depth <= 0) return null;

  const node = await MlmRegistration.findOne({
    where: { customer_id: customerId },   
    include: [
      {
        model: Customer,
        as: 'customer',
        attributes: ['id', 'username', 'email']
      },
      {
        model: Customer,
        as: 'upline',
        attributes: ['id', 'username']
      },
      {
        model: Customer,
        as: 'referrer',
        attributes: ['id', 'username']
      },
      {
        model: MLMPackage,
        as: 'package',
        attributes: [
          ['MLMPackageID', 'id'],
          'MLMPackageName',
          'PackageValue'
        ]
      }
    ]
  });

  if (!node) return null;

  const result = {
    id: node.id,
    placement_pos: node.placement_pos,
    level: node.mlm_level,
    customer: node.customer ? {
      id: node.customer.id,
      username: node.customer.username,
      email: node.customer.email
    } : null,
    upline: node.upline ? { id: node.upline.id, username: node.upline.username } : null,
    referrer: node.referrer ? { id: node.referrer.id, username: node.referrer.username } : null,
    package: node.package ? {
      id: node.package.id,
      name: node.package.MLMPackageName,
      value: node.package.PackageValue
    } : null,
    children: []
  };

  // 🔑 ambil anak berdasarkan upline_id = customer_id parent
  const children = await MlmRegistration.findAll({
    where: { upline_id: node.customer_id },
    attributes: ['id', 'customer_id', 'placement_pos', 'mlm_level'],
    include: [
      { model: Customer, as: 'customer', attributes: ['id', 'username'] },
      { model: MLMPackage, as: 'package', attributes: [['MLMPackageID', 'id'], 'MLMPackageName', 'PackageValue'] }
    ]
  });

  for (const child of children) {
    const childTree = await buildTree(child.customer_id, depth - 1);
    if (childTree) result.children.push(childTree);
  }

  return result;
}

exports.getAdminTree = async (req, res) => {
  try {
    const { rootCustomerId } = req.query;

    // kalau admin pilih root manual
    let root;
    if (rootCustomerId) {
      root = await MlmRegistration.findOne({
        where: { customer_id: rootCustomerId },
        include: [{ model: Customer, as: 'customer', attributes: ['id', 'username'] }]
      });
    } else {
      // default: founder MLM (upline_id = NULL)
      root = await MlmRegistration.findOne({
        where: { upline_id: null },
        include: [{ model: Customer, as: 'customer', attributes: ['id', 'username'] }]
      });
    }

    if (!root) {
      return res.status(404).json({ message: 'Tidak ada data MLM' });
    }

    const tree = await buildTree(root.customer_id, 5); 
    res.json({ success: true, data: tree });
  } catch (err) {
    console.error('Error getAdminTree:', err);
    res.status(500).json({ success: false, message: 'Gagal load MLM tree' });
  }
};
