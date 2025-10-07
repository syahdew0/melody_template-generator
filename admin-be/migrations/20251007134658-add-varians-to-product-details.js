'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.addColumn('product_details', 'default_variant_id', {
    //   type: Sequelize.INTEGER.UNSIGNED,
    //   allowNull: true,
    //   references: {
    //     model: 'product_variants',
    //     key: 'id'
    //   },
    //   onUpdate: 'NO ACTION',
    //   onDelete: 'SET NULL'
    // })

    // await queryInterface.addColumn('product_details', 'stock_integrated', {
    //   type: Sequelize.BOOLEAN,
    //   defaultValue: false
    // })

    await queryInterface.addColumn('product_details', 'variant_price_min', {
      type: Sequelize.DECIMAL(15,2),
      allowNull: true
    })
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeColumn('product_details', 'stock_integrated')
    await queryInterface.removeColumn('product_details', 'variant_price_min')
  }
}
