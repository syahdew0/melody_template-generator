'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('posts', 'type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'ID dari post_types'
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('posts', 'type_id')
  }
}
