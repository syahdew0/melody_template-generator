'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_variant_values', {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      variant_id: { 
        type: Sequelize.INTEGER.UNSIGNED, 
        allowNull: false,
        references: { model: 'product_variants', key: 'id' },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION',
      },
      option_id: { 
        type: Sequelize.INTEGER.UNSIGNED, 
        allowNull: false,
        references: { model: 'product_variant_options', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      value: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_variant_values');
  },
};
