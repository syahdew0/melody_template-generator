'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_variants', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'posts', key: 'id' },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION',
      },
      combination: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      sku: { type: Sequelize.STRING, allowNull: true },
      price: { type: Sequelize.DECIMAL(15,2), allowNull: false },
      stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      image: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_variants');
  },
};
