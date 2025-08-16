'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orderpayments', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      order_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false
      },
      payment_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      method: { type: Sequelize.STRING(50), allowNull: true },
      payment_proof: { type: Sequelize.STRING(255), allowNull: true },
      status: { 
        type: Sequelize.ENUM('Pending', 'Success', 'Failed'), 
        allowNull: false, 
        defaultValue: 'Pending' 
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('orderpayments');
  }
};
