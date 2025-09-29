'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const tableName = tables.find(t => t.toLowerCase() === 'visimisis');

    if (tableName) {
      await queryInterface.addColumn(tableName, 'stats', {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      });
    } else {
      console.log('Tabel VisiMisis tidak ada, kolom stats tidak ditambahkan.');
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const tableName = tables.find(t => t.toLowerCase() === 'visimisis');

    if (tableName) {
      await queryInterface.removeColumn(tableName, 'stats');
    } else {
      console.log('Tabel VisiMisis tidak ada, kolom stats tidak dihapus.');
    }
  }
};
