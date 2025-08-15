'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('menu_items', [
      {
        id: 28,
        menu_group_id: 3,
        parent_id: null,
        title: 'Beranda',
        path: '/pages/home',
        order: 0,
        isActive: 1,
        created_at: new Date('2025-07-19 14:20:57'),
        updated_at: new Date('2025-07-23 03:29:45')
      },
      {
        id: 29,
        menu_group_id: 3,
        parent_id: null,
        title: 'About',
        path: '/pages/about',
        order: 1,
        isActive: 1,
        created_at: new Date('2025-07-19 14:20:57'),
        updated_at: new Date('2025-07-22 11:00:02')
      },
      {
        id: 31,
        menu_group_id: 4,
        parent_id: null,
        title: 'Tentang Kami',
        path: '/about',
        order: 1,
        isActive: 1,
        created_at: new Date('2025-07-19 17:29:23'),
        updated_at: new Date('2025-07-19 17:29:23')
      },
      {
        id: 32,
        menu_group_id: 4,
        parent_id: null,
        title: 'hhhhh',
        path: '',
        order: 0,
        isActive: 1,
        created_at: new Date('2025-07-19 12:03:41'),
        updated_at: new Date('2025-07-19 12:03:41')
      },
      {
        id: 33,
        menu_group_id: 4,
        parent_id: null,
        title: 'ssss',
        path: '',
        order: 0,
        isActive: 1,
        created_at: new Date('2025-07-19 12:03:45'),
        updated_at: new Date('2025-07-19 12:03:45')
      },
      {
        id: 36,
        menu_group_id: 3,
        parent_id: null,
        title: 'Blog',
        path: '/pages/post',
        order: 0,
        isActive: 1,
        created_at: new Date('2025-07-22 08:53:26'),
        updated_at: new Date('2025-07-22 11:11:39')
      },
      {
        id: 37,
        menu_group_id: 3,
        parent_id: null,
        title: 'Contact',
        path: '/pages/contact',
        order: 0,
        isActive: 1,
        created_at: new Date('2025-07-22 08:53:45'),
        updated_at: new Date('2025-07-23 07:00:42')
      },
      {
        id: 43,
        menu_group_id: 9,
        parent_id: null,
        title: 'Beranda',
        path: 'home',
        order: 0,
        isActive: 1,
        created_at: new Date('2025-07-23 06:32:33'),
        updated_at: new Date('2025-07-23 06:32:33')
      },
      {
        id: 44,
        menu_group_id: 3,
        parent_id: null,
        title: 'login',
        path: '/pages/login',
        order: 0,
        isActive: 1,
        created_at: new Date('2025-07-23 10:58:08'),
        updated_at: new Date('2025-07-23 11:18:34')
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('menu_items', null, {});
  }
};
