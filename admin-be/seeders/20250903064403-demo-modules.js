'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Modules', [
      { name: 'product', type: 'main', description: 'Manajemen produk', createdAt: new Date(), updatedAt: new Date() },
      { name: 'post', type: 'main', description: 'Manajemen post/blog', createdAt: new Date(), updatedAt: new Date() },
      // { name: 'page', type: 'main', description: 'Manajemen halaman statis', createdAt: new Date(), updatedAt: new Date() },
      { name: 'media', type: 'main', description: 'Media', createdAt: new Date(), updatedAt: new Date() },
      { name: 'site setting', type: 'main', description: 'Setting website', createdAt: new Date(), updatedAt: new Date() },
      { name: 'komentar', type: 'main', description: 'n', createdAt: new Date(), updatedAt: new Date() },
      { name: 'company bank', type: 'main', description: '', createdAt: new Date(), updatedAt: new Date() },
      { name: 'bank customer', type: 'main', description: '', createdAt: new Date(), updatedAt: new Date() },
      { name: 'daftar customer', type: 'main', description: '', createdAt: new Date(), updatedAt: new Date() },
      { name: 'role', type: 'main', description: 'Manajemen role', createdAt: new Date(), updatedAt: new Date() },


      { name: 'Topups', type: 'other', description: 'Halaman pengaturan topups', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Withdraw', type: 'other', description: 'Halaman pengaturan withdraw', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Adjust', type: 'other', description: 'Halaman pengaturan transfer', createdAt: new Date(), updatedAt: new Date() }

    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Modules', null, {});
  }
};
