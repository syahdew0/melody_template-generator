'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('RoleActiveModules', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      RoleId: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      ModuleId: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      canView: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      canAdd: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      canEdit: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      canDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('RoleActiveModules');
  }
};
