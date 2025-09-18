module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
    },
      RoleId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id',
      },
    },

    isSuperAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'https://i.pravatar.cc/100',
    },
  }, {
    freezeTableName: true,
    tableName: 'users',  
    timestamps: true,
  
  });

  User.associate = function (models) {
    User.belongsTo(models.Role, { foreignKey: 'RoleId', as: 'Role' });
  };

  return User;
};
