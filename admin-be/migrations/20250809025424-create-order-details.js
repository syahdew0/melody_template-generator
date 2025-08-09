'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orderdetails', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      order_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
        onDelete: 'NO ACTION'
      },
      product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      product_name: { type: Sequelize.STRING(255), allowNull: false },
      qty: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      price: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
      subtotal: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('orderdetails');
  }
};
