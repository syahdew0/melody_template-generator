'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'status', {
      type: Sequelize.ENUM('Unpaid', 'Paid', 'Cancel', 'Refund', 'Payment Expired'),
      allowNull: false,
      defaultValue: 'Unpaid'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'status');
  }
};
