'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('menu_groups', [
      {
        name: 'Main Menu',
        slug: 'main',
        is_main: 1,
        is_footer: 0,
        is_top: 0,
        type: 'default',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Footer Menu',
        slug: 'footer',
        is_main: 0,
        is_footer: 1,
        is_top: 0,
        type: 'default',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'After Login',
        slug: 'after-login',
        is_main: 1,
        is_footer: 0,
        is_top: 0,
        type: 'static',
        created_at: new Date(),
        updated_at: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('menu_groups', {
      slug: { [Sequelize.Op.in]: ['main', 'footer', 'after-login'] }
    }, {});
  }
};
