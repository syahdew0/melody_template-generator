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
  placement_pos: DataTypes.ENUM('left','right','root'),
  referral_id: DataTypes.INTEGER,
  mlm_level: DataTypes.INTEGER,
  points_left: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  points_right: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
}, {
  tableName: 'mlm_registrations',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

  MlmRegistration.associate = (models) => {
    // relasi ke customer
    MlmRegistration.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      as: 'Customer',
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
    MlmRegistration.belongsTo(models.Customer, {
  foreignKey: 'referral_id',
  as: 'referrer',
});

MlmRegistration.hasMany(models.MlmRegistration, {
  foreignKey: 'upline_id',
  as: 'downlines',
});

  };

  return MlmRegistration;
};
