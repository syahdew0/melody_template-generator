'use strict';

/**
 * Pastikan post_types memiliki entry 'listing' dengan id 6 jika slot tersedia.
 * - Jika name 'listing' sudah ada, tidak diubah.
 * - Jika belum ada dan id=6 kosong, insert dengan id=6.
 * - Jika id=6 sudah terpakai untuk nama lain, insert 'listing' tanpa memaksa id.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM post_types WHERE name = 'listing' LIMIT 1`
    );
    if (existing && existing.length > 0) {
      return; // sudah ada
    }

    const [idSix] = await queryInterface.sequelize.query(
      `SELECT id FROM post_types WHERE id = 6 LIMIT 1`
    );

    const payload = {
      name: 'listing',
      created_at: new Date(),
      updated_at: new Date(),
    };

    // jika id 6 kosong, gunakan id 6 agar konsisten dengan FE yang mengirim 6
    if (!idSix || idSix.length === 0) {
      payload.id = 6;
    }

    await queryInterface.bulkInsert('post_types', [payload]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('post_types', { name: 'listing' });
  },
};
