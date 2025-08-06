'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('wallet_histories', 'wallet_type', {
      type: Sequelize.ENUM('saldo', 'point', 'stamp'),
      allowNull: false,
      defaultValue: 'saldo',
    });

    await queryInterface.addIndex('wallet_histories', ['wallet_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('wallet_histories', ['wallet_type']);
    await queryInterface.removeColumn('wallet_histories', 'wallet_type');

    // Penting: hapus ENUM dari database
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_wallet_histories_wallet_type;");
  },
};
