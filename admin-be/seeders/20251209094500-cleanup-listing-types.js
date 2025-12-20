'use strict';

/**
 * Hapus duplikasi listing_types, simpan hanya id terkecil per name.
 * Aman dijalankan berulang.
 */
module.exports = {
  async up(queryInterface) {
    // Delete rows whose id is not the smallest per name
    await queryInterface.sequelize.query(`
      DELETE lt
      FROM listing_types lt
      JOIN (
        SELECT name, MIN(id) AS keep_id
        FROM listing_types
        GROUP BY name
        HAVING COUNT(*) > 1
      ) dup ON dup.name = lt.name
      WHERE lt.id <> dup.keep_id;
    `);
  },

  async down() {
    // tidak perlu rollback; duplikasi dihapus permanen
  },
};
