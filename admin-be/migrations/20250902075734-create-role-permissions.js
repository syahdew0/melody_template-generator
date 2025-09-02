'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('RolePermissions', {
      RoleId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Roles',
          key: 'id'
        },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION'
      },
      PermissionId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Permissions',
          key: 'id'
        },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Tambahkan composite primary key
    await queryInterface.addConstraint('RolePermissions', {
      fields: ['RoleId', 'PermissionId'],
      type: 'primary key',
      name: 'PK_RolePermissions'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('RolePermissions');
  }
};

