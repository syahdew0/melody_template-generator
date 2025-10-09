'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('product_details', 'brand_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'brands', // pastikan ini nama tabel brands
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'product_type_id' // optional: posisi kolom
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('product_details', 'brand_id');
  }
};
