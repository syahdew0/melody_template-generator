'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('menu_items', [
      // Untuk menu group ID 1 (After Login)
      {
        menu_group_id: 1,
        parent_id: null,
        title: 'Beranda',
        path: '/beranda',
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_group_id: 1,
        parent_id: null,
        title: 'Tentang Kami',
        path: '/tentang-kami',
        order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_group_id: 1,
        parent_id: null,
        title: 'Kontak',
        path: '/kontak',
        order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Untuk menu group ID 2 (Menu Atas)
      {
        menu_group_id: 2,
        parent_id: null,
        title: 'Beranda',
        path: '/beranda',
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_group_id: 2,
        parent_id: null,
        title: 'Tentang Kami',
        path: '/tentang-kami',
        order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_group_id: 2,
        parent_id: null,
        title: 'Kontak',
        path: '/kontak',
        order: 3,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('menu_items', null, {});
  }
};
