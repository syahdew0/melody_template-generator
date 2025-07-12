'use strict';
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('menus', [
      { name: 'Home', path: null, parent_id: null, order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Slider', path: '/admin/slider', parent_id: 1, order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'About', path: null, parent_id: null, order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Our Team', path: '/admin/ourteam', parent_id: 3, order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
    ], {});
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('menus', null, {});
  }
};
