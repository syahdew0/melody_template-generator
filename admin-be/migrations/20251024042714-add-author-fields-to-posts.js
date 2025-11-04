'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('posts', 'author_name', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'excerpt'
    })

    await queryInterface.addColumn('posts', 'author_position', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'author_name'
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('posts', 'author_name')
    await queryInterface.removeColumn('posts', 'author_position')
  }
}