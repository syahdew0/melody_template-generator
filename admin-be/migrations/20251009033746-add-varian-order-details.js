'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orderdetails', 'variant_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'product_id' 
    });

    await queryInterface.addColumn('orderdetails', 'variant_combination', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'variant_id' 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orderdetails', 'variant_combination');
    await queryInterface.removeColumn('orderdetails', 'variant_id');
  }
};
