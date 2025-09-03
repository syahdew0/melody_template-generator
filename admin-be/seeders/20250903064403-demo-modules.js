'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Modules', [
      { name: 'product', type: 'main', description: 'Manajemen produk', createdAt: new Date(), updatedAt: new Date() },
      { name: 'post', type: 'main', description: 'Manajemen post/blog', createdAt: new Date(), updatedAt: new Date() },
      { name: 'page', type: 'main', description: 'Manajemen halaman statis', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Boleh Approve Topups', type: 'other', description: 'Halaman pengaturan topups', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Boleh ApproveWithdraw', type: 'other', description: 'Halaman pengaturan withdraw', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Modules', null, {});
  }
};
