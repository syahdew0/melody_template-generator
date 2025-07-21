'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tambahkan kolom title jika belum ada
    const table = await queryInterface.describeTable('websites');
    if (!table.title) {
      await queryInterface.addColumn('websites', 'title', {
        type: Sequelize.STRING,
        after: 'site_title',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('websites');
    if (table.title) {
      await queryInterface.removeColumn('websites', 'title');
    }
  }
};
