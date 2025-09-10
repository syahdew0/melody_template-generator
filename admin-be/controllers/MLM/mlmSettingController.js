const { MLMSetting, MLMPosition, MLMWallet, WalletType, sequelize } = require('../../models');
const { QueryTypes } = require('sequelize');

module.exports = {
  async getSettings(req, res) {
    try {
      const settings = await MLMSetting.findOne();
      if (!settings) return res.status(404).json({ message: 'Pengaturan MLM belum dibuat' });

      // Ambil posisi
      const positions = await MLMPosition.findAll({ raw: true });
      const posMapped = positions.map(p => ({ name: p.MLMPositionName || '', value: p.Value || 0 }));

      // Ambil wallet types & wallet
      const walletTypes = await WalletType.findAll({ raw: true });
      const walletsDb = await MLMWallet.findAll({ raw: true });
      const wallets = walletsDb.map(w => {
        const wt = walletTypes.find(t => t.id === w.WalletTypeID);
        return {
          id: w.MLMWalletID,
          walletTypeID: w.WalletTypeID,
          name: wt?.name || '', // jangan biarkan undefined
          percent: w.Percentage || 0,
          active: true
        };
      });

      res.json({
        ...settings.toJSON(),
        positions: posMapped.length ? posMapped : [],
        wallets: wallets.length ? wallets : [],
        maxHariTransaksi: settings.MaxHariTransaksi || 0,
        maxIklanPerHari: settings.MaxIklanPerHari || 0,
        autoApprove: !!settings.AutoApprove,
        samePackage: !!settings.SamePackage,
        autoHold: !!settings.AutoHold,
        maxChild: settings.MaxChild || 0,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

// Update pengaturan MLM + posisi + wallets
async updateSettings(req, res) {
  const t = await sequelize.transaction();
  try {
    const data = req.body;

    const safeStringify = (val) => (val ? (typeof val === 'string' ? val : JSON.stringify(val)) : '[]');

    let settings = await MLMSetting.findOne({ transaction: t });

    const payload = {
      MaxHariTransaksi: Number(data.MaxHariTransaksi || data.maxHariTransaksi),
      MaxIklanPerHari: Number(data.MaxIklanPerHari || data.maxIklanPerHari),
      AutoApprove: data.AutoApprove !== undefined ? Number(data.AutoApprove) : (data.autoApprove ? 1 : 0),
      SamePackage: data.SamePackage !== undefined ? Number(data.SamePackage) : (data.samePackage ? 1 : 0),
      AutoHold: data.AutoHold !== undefined ? Number(data.AutoHold) : (data.autoHold ? 1 : 0),
      MaxChild: Number(data.MaxChild || data.maxChild),
      Positions: safeStringify(data.Positions || data.positions),
      Wallets: safeStringify(data.Wallets || data.wallets),
      UpdatedOn: new Date(),
      UpdatedBy: req.user?.username || 'system',
    };

    // Buat atau update MLMSetting
    if (!settings) {
      settings = await MLMSetting.create(
        { ...payload, CreatedOn: new Date(), CreatedBy: req.user?.username || 'system' },
        { transaction: t }
      );
    } else {
      await settings.update(payload, { transaction: t });
    }

    // ---- Update MLMPosition ----
    if (Array.isArray(data.positions) && data.positions.length > 0) {
      await MLMPosition.destroy({ where: {}, transaction: t });
      await MLMPosition.bulkCreate(
        data.positions.map(pos => ({ MLMPositionName: pos.name, Value: pos.value })),
        { transaction: t }
      );
    }

    // ---- Update MLMWallets ----
    if (Array.isArray(data.wallets) && data.wallets.length > 0) {
      const walletTypes = await sequelize.query(
        `SELECT * FROM wallet_types`,
        { type: QueryTypes.SELECT, transaction: t }
      );

      // Hapus wallet lama
      await MLMWallet.destroy({ where: {}, transaction: t });

      for (const w of data.wallets) {
        if (!w.active) continue;

        const wt = walletTypes.find(t => t.name.toLowerCase() === (w.name || '').toLowerCase());
        if (!wt) continue;

        await MLMWallet.create(
          { WalletTypeID: wt.id, Percentage: w.percent || 0 },
          { transaction: t }
        );
      }
    }

    await t.commit();

    // Ambil ulang positions dan wallets terbaru
    const currentPositions = await MLMPosition.findAll({ raw: true });
    const currentWallets = await MLMWallet.findAll({ raw: true });

    res.json({
      ...settings.toJSON(),
      positions: currentPositions.length
        ? currentPositions.map(p => ({ name: p.MLMPositionName, value: p.Value }))
        : JSON.parse(settings.Positions || '[]'),
      wallets: currentWallets.length
        ? currentWallets.map(w => ({ id: w.MLMWalletID, walletTypeID: w.WalletTypeID, percent: w.Percentage }))
        : JSON.parse(settings.Wallets || '[]'),
      maxHariTransaksi: settings.MaxHariTransaksi,
      maxIklanPerHari: settings.MaxIklanPerHari,
      autoApprove: !!settings.AutoApprove,
      samePackage: !!settings.SamePackage,
      autoHold: !!settings.AutoHold,
      maxChild: settings.MaxChild,
    });

  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
,
};