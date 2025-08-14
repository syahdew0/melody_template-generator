// 'use strict';

// /** @type {import('sequelize-cli').Seeder} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.bulkInsert('menu_groups', [
//       {
//         id: 1,
//         name: 'After Login',
//         slug: 'after-login',
//         is_top: true,
//         is_main: false,
//         is_footer: true,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         id: 2,
//         name: 'Menu Atas',
//         slug: 'menu-atas',
//         is_top: true,
//         is_main: true,
//         is_footer: true,
//         created_at: new Date(),
//         updated_at: new Date(),
//       }
//     ], {});
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.bulkDelete('menu_groups', {
//       id: { [Sequelize.Op.in]: [1, 2] }
//     }, {});
//   }
// };

// 'use strict';

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkInsert('menu_groups', [
//       {
//         name: 'Main Menu',
//         slug: 'main',
//         is_main: true,
//         is_footer: false,
//         is_after: false,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         name: 'Footer Menu',
//         slug: 'footer',
//         is_main: false,
//         is_footer: true,
//         is_after: false,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         id: 9,
//         name: 'After Login',
//         slug: 'after-login',
//         is_main: 1,
//         is_footer: 0,
//         is_top: 0,
//         type: 'static',
//         created_at: new Date('2025-07-23 06:27:39'),
//         updated_at: new Date('2025-07-23 09:27:54')
//       },
//     ], {});
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkDelete('menu_groups', null, {});
//   }
// };

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('menu_groups', [
      {
        id: 3,
        name: 'Main Menu',
        slug: 'main',
        is_main: 1,
        is_footer: 0,
        is_top: 0,
        type: 'default', 
        created_at: new Date('2025-07-19 13:32:24'),
        updated_at: new Date('2025-07-23 09:09:09')
      },
      {
        id: 4,
        name: 'Footer Menu',
        slug: 'footer',
        is_main: 0,
        is_footer: 1,
        is_top: 0,
        type: 'default', 
        created_at: new Date('2025-07-19 17:27:44'),
        updated_at: new Date('2025-07-22 08:22:31')
      },
      {
        id: 9,
        name: 'After Login',
        slug: 'after-login',
        is_main: 1,
        is_footer: 0,
        is_top: 0,
        type: 'static',
        created_at: new Date('2025-07-23 06:27:39'),
        updated_at: new Date('2025-07-23 09:27:54')
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('menu_groups', null, {});
  }
};