'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Customers', 'password_reset_code', {
      type: Sequelize.STRING(10),
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('Customers', 'password_reset_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addIndex('Customers', ['password_reset_code'], {
      name: 'idx_customers_password_reset_code',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Customers', 'idx_customers_password_reset_code');
    await queryInterface.removeColumn('Customers', 'password_reset_expires_at');
    await queryInterface.removeColumn('Customers', 'password_reset_code');
  }
};
