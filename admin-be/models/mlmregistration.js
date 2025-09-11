module.exports = (sequelize, DataTypes) => {
  const MlmRegistration = sequelize.define('MlmRegistration', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: DataTypes.INTEGER,
    mlm_package_id: DataTypes.INTEGER,
    upline_id: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
    },
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    notes: DataTypes.TEXT,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    tableName: 'mlm_registrations',
    underscored: true,
    timestamps: false, // kita pakai created_at & updated_at manual
  });

  MlmRegistration.associate = (models) => {
    // relasi ke customer
    MlmRegistration.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      as: 'customer',
    });

    // relasi ke package
    MlmRegistration.belongsTo(models.MLMPackage, {
      foreignKey: 'mlm_package_id',
      as: 'package',
    });

    // relasi ke upline
    MlmRegistration.belongsTo(models.Customer, {
      foreignKey: 'upline_id',
      as: 'upline',
    });
  };

  return MlmRegistration;
};
