'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transaction_types', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      }
    });

    await queryInterface.bulkInsert('transaction_types', [
      { id: 1, name: 'topup', created_at: new Date() },
      { id: 2, name: 'withdraw', created_at: new Date() },
      { id: 3, name: 'withdraw_dibatalkan', created_at: new Date() },
      { id: 4, name: 'withdraw_ditolak', created_at: new Date() },
      { id: 5, name: 'adjust_plus', created_at: new Date() },
      { id: 6, name: 'adjust_minus', created_at: new Date() },
      { id: 7, name: 'point_plus', created_at: new Date() },
      { id: 8, name: 'point_minus', created_at: new Date() },
      { id: 9, name: 'stamp_plus', created_at: new Date() },
      { id: 10, name: 'stamp_minus', created_at: new Date() },
      { id: 11, name: 'order', created_at: new Date() },
      { id: 12, name: 'order_ditolak', created_at: new Date() },
      { id: 13, name: 'order_dibatalkan', created_at: new Date() },
      { id: 14, name: 'mlm_join', created_at: new Date() },
      { id: 99, name: 'referral_bonus', created_at: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transaction_types');
  }
};
