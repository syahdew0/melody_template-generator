'use strict';

/** Pastikan post_types punya entry 'listing' (dibutuhkan untuk display_in kategori). */

module.exports = {
  async up(queryInterface) {
    // cek apakah sudah ada
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM post_types WHERE name = 'listing' LIMIT 1`
    );

    if (rows && rows.length > 0) {
      return; // sudah ada, tidak perlu insert
    }

    await queryInterface.bulkInsert('post_types', [
      {
        name: 'listing',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('post_types', { name: 'listing' });
  },
};
