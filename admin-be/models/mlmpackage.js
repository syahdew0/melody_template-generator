module.exports = (sequelize, DataTypes) => {
  const MLMPackage = sequelize.define('MLMPackage', {
    MLMPackageID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MLMPackageName: DataTypes.STRING,
    Days: DataTypes.INTEGER,
    PackageValue: DataTypes.DOUBLE,
    ReferralBonus: DataTypes.DOUBLE,
    ROI: DataTypes.DOUBLE,
    Pairing: DataTypes.DOUBLE,
    MaxPairing: DataTypes.DOUBLE,
    OtherMatching: DataTypes.DOUBLE,
    MatchingLevel: DataTypes.INTEGER,
    RandomLevel: DataTypes.INTEGER,
    TicketNumber: DataTypes.INTEGER,
    IsSuspend: DataTypes.BOOLEAN,
    SkipSuspended: { type: DataTypes.BOOLEAN, defaultValue: false }, // ⬅️ tambahan
    SkipSuspendedOption: { type: DataTypes.ENUM('skip', 'pass_up', 'random'), defaultValue: 'skip' }, // ⬅️ tambahan
    Description: DataTypes.TEXT,
    CreatedOn: DataTypes.DATE,
    CreatedBy: DataTypes.STRING,
    UpdateOn: DataTypes.DATE,
    UpdateBy: DataTypes.STRING,
  }, { 
    tableName: 'mlmpackages', 
    timestamps: false 
  });

  MLMPackage.associate = (models) => {
    MLMPackage.hasMany(models.MLMPackageMatching, { foreignKey: 'MLMPackageID', as: 'matchings' });
    MLMPackage.hasMany(models.MLMPackageRandom, { foreignKey: 'MLMPackageID', as: 'randomMatchings' });
  };

  return MLMPackage;
};
