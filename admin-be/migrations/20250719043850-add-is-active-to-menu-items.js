'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('menu_items', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

down: async (queryInterface, Sequelize) => {
  // Hanya hapus kolom jika ada
  const table = await queryInterface.describeTable('menu_items');
  if (table.isActive) {
    await queryInterface.removeColumn('menu_items', 'isActive');
  }
  },
};

