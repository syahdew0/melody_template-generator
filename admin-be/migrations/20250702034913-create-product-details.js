'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_details', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      post_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id'
        },
        onDelete: 'NO ACTION'
      },
      price: Sequelize.DECIMAL,
      discount_price: Sequelize.DECIMAL,
      discount_until: Sequelize.DATE,
      weight: Sequelize.FLOAT,
      unit_name: Sequelize.STRING,
      purchase_price: Sequelize.DECIMAL,
      admin_info: Sequelize.TEXT,
      formula_price: Sequelize.STRING,
      is_preorder: Sequelize.BOOLEAN,
      product_type_id: Sequelize.INTEGER,
      minimum_qty: Sequelize.INTEGER,
      stock_integrated: Sequelize.BOOLEAN,
      stock: Sequelize.INTEGER,
      initial_stock: Sequelize.INTEGER,
      dp_percentage: Sequelize.FLOAT,
      minimum_order: Sequelize.INTEGER,
      dimension: Sequelize.STRING,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,            
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_details');
  }
};