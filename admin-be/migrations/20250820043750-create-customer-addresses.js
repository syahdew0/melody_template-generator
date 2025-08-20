'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer_addresses', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: { type: Sequelize.INTEGER, allowNull: false },
      recipient_name: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: false },
      address: { type: Sequelize.TEXT, allowNull: false },
      province: { type: Sequelize.STRING, allowNull: true },
      city: { type: Sequelize.STRING, allowNull: true },
      district: { type: Sequelize.STRING, allowNull: true },
      postal_code: { type: Sequelize.STRING, allowNull: true },
      latitude: { type: Sequelize.STRING, allowNull: true },
      longitude: { type: Sequelize.STRING, allowNull: true },
      is_default: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer_addresses');
  }
};
