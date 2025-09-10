const { MLMPackage, MLMPackageMatching, MLMPackageRandom, MLMTypeDetail, MLMPosition, sequelize } = require('../../models');

module.exports = {
  // Get all packages
  async getAll(req, res) {
    try {
      const packages = await MLMPackage.findAll({
        include: [
          { model: MLMPackageMatching, as: 'matchings' },
          { model: MLMPackageRandom, as: 'randomMatchings' },
        ],
      });
      res.json(packages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get package by ID
  async getById(req, res) {
    try {
      const pkg = await MLMPackage.findByPk(req.params.id, {
        include: [
          { model: MLMPackageMatching, as: 'matchings' },
          { model: MLMPackageRandom, as: 'randomMatchings' },
        ],
      });
      if (!pkg) return res.status(404).json({ message: 'Package not found' });
      res.json(pkg);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // Create package
  async create(req, res) {
    const t = await sequelize.transaction();
    try {
      const {
        nama,
        prioritas,
        jumlah_hari,
        jumlah_shares,
        roi,
        roi_percent,
        value,
        bonus_referral,
        pairing,
        max_pairing,
        other_matching,
        skip_suspended,
        skip_suspended_option,
        keterangan,
        suspended,
        include_matching_random,
        matchings,
        random_matchings,
        MLMTypeID, // baru
      } = req.body;

      const newPackage = await MLMPackage.create({
        MLMPackageName: nama,
        MLMPackageTypeID: MLMTypeID || null, // hubungkan type
        Priority: prioritas,
        Days: jumlah_hari,
        Shares: jumlah_shares,
        ROI: roi,
        ROIIsPercent: roi_percent ? 1 : 0,
        PackageValue: value,
        ReferralBonus: bonus_referral,
        Pairing: pairing,
        MaxPairing: max_pairing,
        OtherMatching: other_matching,
        SkipSuspended: skip_suspended ? 1 : 0,
        SkipSuspendedOption: skip_suspended_option || 'skip',
        IncludeMatchingRandom: include_matching_random ? 1 : 0,
        MatchingLevel: matchings?.length || 0,
        RandomLevel: random_matchings?.length || 0,
        IsSuspend: suspended ? 1 : 0,
        Description: keterangan,
        CreatedOn: new Date(),
        CreatedBy: req.user?.username || 'system',
        UpdateOn: new Date(),
        UpdateBy: req.user?.username || 'system',
      }, { transaction: t });

      // Jika pilih MLMType, buat matching otomatis dari type details
      if (MLMTypeID) {
        const typeDetails = await MLMTypeDetail.findAll({
          where: { MLMTypeID },
          include: [{ model: MLMPosition, as: 'position' }],
          transaction: t
        });

        for (const detail of typeDetails) {
          await MLMPackageMatching.create({
            MLMPackageID: newPackage.MLMPackageID,
            Level: detail.MLMPositionID, // level sesuai posisi
            Percentage: detail.Value
          }, { transaction: t });
        }
      } else if (Array.isArray(matchings)) {
        // Jika tidak pilih type, pakai manual
        for (let i = 0; i < matchings.length; i++) {
          await MLMPackageMatching.create({
            MLMPackageID: newPackage.MLMPackageID,
            Level: i + 1,
            Percentage: matchings[i].percentage,
          }, { transaction: t });
        }
      }

      // Random matchings tetap manual
      if (Array.isArray(random_matchings)) {
        for (let i = 0; i < random_matchings.length; i++) {
          await MLMPackageRandom.create({
            MLMPackageID: newPackage.MLMPackageID,
            Level: i + 1,
            Percentage: random_matchings[i].percentage,
          }, { transaction: t });
        }
      }

      await t.commit();
      res.status(201).json(newPackage);

    } catch (err) {
      await t.rollback();
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // Update package
  async update(req, res) {
    const t = await sequelize.transaction();
    try {
      const id = req.params.id;
      const {
        nama,
        prioritas,
        jumlah_hari,
        jumlah_shares,
        roi,
        roi_percent,
        value,
        bonus_referral,
        pairing,
        max_pairing,
        other_matching,
        skip_suspended,
        skip_suspended_option,
        keterangan,
        suspended,
        include_matching_random,
        matchings,
        random_matchings,
        MLMTypeID, // baru
      } = req.body;

      const pkg = await MLMPackage.findByPk(id);
      if (!pkg) return res.status(404).json({ message: 'Package not found' });

      await pkg.update({
        MLMPackageName: nama,
        MLMPackageTypeID: MLMTypeID || null,
        Priority: prioritas,
        Days: jumlah_hari,
        Shares: jumlah_shares,
        ROI: roi,
        ROIIsPercent: roi_percent ? 1 : 0,
        PackageValue: value,
        ReferralBonus: bonus_referral,
        Pairing: pairing,
        MaxPairing: max_pairing,
        OtherMatching: other_matching,
        SkipSuspended: skip_suspended ? 1 : 0,
        SkipSuspendedOption: skip_suspended_option || 'skip',
        IncludeMatchingRandom: include_matching_random ? 1 : 0,
        MatchingLevel: matchings?.length || 0,
        RandomLevel: random_matchings?.length || 0,
        IsSuspend: suspended ? 1 : 0,
        Description: keterangan,
        UpdateOn: new Date(),
        UpdateBy: req.user?.username || 'system',
      }, { transaction: t });

      // Reset matchings lama
      await MLMPackageMatching.destroy({ where: { MLMPackageID: id }, transaction: t });
      await MLMPackageRandom.destroy({ where: { MLMPackageID: id }, transaction: t });

      // Jika pilih type, buat matching dari type details
      if (MLMTypeID) {
        const typeDetails = await MLMTypeDetail.findAll({
          where: { MLMTypeID },
          include: [{ model: MLMPosition, as: 'position' }],
          transaction: t
        });

        for (const detail of typeDetails) {
          await MLMPackageMatching.create({
            MLMPackageID: id,
            Level: detail.MLMPositionID,
            Percentage: detail.Value
          }, { transaction: t });
        }
      } else if (Array.isArray(matchings)) {
        for (let i = 0; i < matchings.length; i++) {
          await MLMPackageMatching.create({
            MLMPackageID: id,
            Level: i + 1,
            Percentage: matchings[i].percentage,
          }, { transaction: t });
        }
      }

      // Random matchings tetap manual
      if (Array.isArray(random_matchings)) {
        for (let i = 0; i < random_matchings.length; i++) {
          await MLMPackageRandom.create({
            MLMPackageID: id,
            Level: i + 1,
            Percentage: random_matchings[i].percentage,
          }, { transaction: t });
        }
      }

      await t.commit();
      res.json(pkg);

    } catch (err) {
      await t.rollback();
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // Delete package
  async delete(req, res) {
    const t = await sequelize.transaction();
    try {
      const id = req.params.id;

      await MLMPackageMatching.destroy({ where: { MLMPackageID: id }, transaction: t });
      await MLMPackageRandom.destroy({ where: { MLMPackageID: id }, transaction: t });
      const deleted = await MLMPackage.destroy({ where: { MLMPackageID: id }, transaction: t });

      await t.commit();
      res.json({ message: 'Package deleted', deleted });
    } catch (err) {
      await t.rollback();
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
};
