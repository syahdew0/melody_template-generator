'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wallet_types', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // Insert default types
    await queryInterface.bulkInsert('wallet_types', [
      { id: 1, name: 'saldo' },
      { id: 2, name: 'point' },
      { id: 3, name: 'stamp' }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('wallet_types');
  }
};
