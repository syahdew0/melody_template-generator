// 'use strict';

// /** @type {import('sequelize-cli').Seeder} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.bulkInsert('menu_items', [
//       {
//         menu_group_id: 1,
//         parent_id: null,
//         title: 'Beranda',
//         path: '/beranda',
//         order: 1,
//         created_at: new Date(),
//         updated_at: new Date()
//       },
//       {
//         menu_group_id: 1,
//         parent_id: null,
//         title: 'Tentang Kami',
//         path: '/tentang-kami',
//         order: 2,
//         created_at: new Date(),
//         updated_at: new Date()
//       },
//       {
//         menu_group_id: 1,
//         parent_id: null,
//         title: 'Kontak',
//         path: '/kontak',
//         order: 3,
//         created_at: new Date(),
//         updated_at: new Date()
//       },

//       {
//         menu_group_id: 2,
//         parent_id: null,
//         title: 'Beranda',
//         path: '/beranda',
//         order: 1,
//         created_at: new Date(),
//         updated_at: new Date()
//       },
//       {
//         menu_group_id: 2,
//         parent_id: null,
//         title: 'Tentang Kami',
//         path: '/tentang-kami',
//         order: 2,
//         created_at: new Date(),
//         updated_at: new Date()
//       },
//       {
//         menu_group_id: 2,
//         parent_id: null,
//         title: 'Kontak',
//         path: '/kontak',
//         order: 3,
//         created_at: new Date(),
//         updated_at: new Date()
//       }
//     ], {});
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.bulkDelete('menu_items', null, {});
//   }
// };


'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('menu_items', [
      {
        menu_group_id: 1, // Main Menu
        title: 'Beranda',
        path: '/',
        icon: null,
        parent_id: null,
        order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        menu_group_id: 1,
        title: 'Tentang Kami',
        path: '/tentang-kami',
        icon: null,
        parent_id: null,
        order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        menu_group_id: 2, // Footer Menu
        title: 'Kebijakan Privasi',
        path: '/kebijakan-privasi',
        icon: null,
        parent_id: null,
        order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        menu_group_id: 2,
        title: 'Syarat & Ketentuan',
        path: '/syarat-ketentuan',
        icon: null,
        parent_id: null,
        order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('menu_items', null, {});
  }
};
