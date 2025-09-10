'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mlmwallets', {
      MLMWalletID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      WalletTypeID: { type: Sequelize.INTEGER, allowNull: false },
      Percentage: { type: Sequelize.DOUBLE, allowNull: false },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('mlmwallets');
  },
};
