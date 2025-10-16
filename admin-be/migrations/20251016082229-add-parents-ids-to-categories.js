'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'parent_ids', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Simpan multi parent IDs sebagai array, misal [10,12]'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('categories', 'parent_ids');
  }
};
