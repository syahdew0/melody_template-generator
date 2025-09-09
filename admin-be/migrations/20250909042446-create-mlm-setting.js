'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MLMSettings', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      maxHariTransaksi: {
        type: Sequelize.INTEGER,
        defaultValue: 2,
      },
      maxIklanPerHari: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      autoApprove: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      samePackage: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      autoHold: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      maxChild: {
        type: Sequelize.INTEGER,
        defaultValue: 2,
      },
      positions: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      wallets: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MLMSettings');
  },
};
