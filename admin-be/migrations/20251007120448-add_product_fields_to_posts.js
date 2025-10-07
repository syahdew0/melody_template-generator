'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('posts', 'discount_percentage', {
      type: Sequelize.FLOAT,
      defaultValue: 0
    });
    await queryInterface.addColumn('posts', 'is_discount_active', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    await queryInterface.addColumn('posts', 'product_type', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('posts', 'variations', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('posts', 'discount_percentage');
    await queryInterface.removeColumn('posts', 'is_discount_active');
    await queryInterface.removeColumn('posts', 'product_type');
    await queryInterface.removeColumn('posts', 'variations');
  }
};
