'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('menu_groups', [
      {
        id: 1,
        name: 'After Login',
        slug: 'after-login',
        is_top: true,
        is_main: false,
        is_footer: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'Menu Atas',
        slug: 'menu-atas',
        is_top: true,
        is_main: true,
        is_footer: true,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('menu_groups', {
      id: { [Sequelize.Op.in]: [1, 2] }
    }, {});
  }
};
