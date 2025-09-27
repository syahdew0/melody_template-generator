'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Modules', [
      { name: 'product', type: 'main', description: 'Manajemen produk', createdAt: new Date(), updatedAt: new Date() },
      { name: 'post', type: 'main', description: 'Manajemen post/blog', createdAt: new Date(), updatedAt: new Date() },
      // { name: 'page', type: 'main', description: 'Manajemen halaman statis', createdAt: new Date(), updatedAt: new Date() },
      { name: 'media', type: 'main', description: 'Media', createdAt: new Date(), updatedAt: new Date() },
      // { name: 'site setting', type: 'main', description: 'Setting website', createdAt: new Date(), updatedAt: new Date() },
      { name: 'komentar', type: 'main', description: 'n', createdAt: new Date(), updatedAt: new Date() },
      { name: 'company bank', type: 'main', description: '', createdAt: new Date(), updatedAt: new Date() },
      { name: 'bank customer', type: 'main', description: '', createdAt: new Date(), updatedAt: new Date() },
      { name: 'daftar customer', type: 'main', description: '', createdAt: new Date(), updatedAt: new Date() },
      { name: 'role', type: 'main', description: 'Manajemen role', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Adjust', type: 'main', description: 'Halaman pengaturan transfer', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Topups', type: 'main', description: 'Halaman pengaturan topups', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Withdraw', type: 'main', description: 'Halaman pengaturan withdraw', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Order', type: 'main', description: 'Halaman pengaturan transfer', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Setting Logo', type: 'main', description: 'Halaman pengaturan Logo', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Setting', type: 'main', description: 'Halaman pengaturan', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Icon Setting', type: 'main', description: 'Halaman pengaturan Icon', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Custome Page', type: 'main', description: 'Halaman pengaturan custome page', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Menu', type: 'main', description: 'Halaman pengaturan menu', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Theme', type: 'main', description: 'Halaman pengaturan Theme', createdAt: new Date(), updatedAt: new Date() },
      { name: 'page', type: 'main', description: 'Halaman pengaturan page', createdAt: new Date(), updatedAt: new Date() },
      // { name: '', type: 'main', description: 'Halaman pengaturan', createdAt: new Date(), updatedAt: new Date() },

      { name: 'Boleh Approve Topups', type: 'other', description: 'Halaman pengaturan topups', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Boleh Approve Withdraw', type: 'other', description: 'Halaman pengaturan withdraw', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Boleh Update Order', type: 'other', description: 'Halaman pengaturan Oerder', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Boleh Approve Komentar', type: 'other', description: 'Halaman pengaturan komentar', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Boleh Assign Menu', type: 'other', description: 'Halaman pengaturan menu', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Boleh Unassign Menu', type: 'other', description: 'Halaman pengaturan menu', createdAt: new Date(), updatedAt: new Date() },
      

    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Modules', null, {});
  }
};
