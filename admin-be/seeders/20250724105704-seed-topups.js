'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('topups', [
      {
        walletid: 1,
        username: 'anis',
        amount: 100000,
        status: 'success',
        remarks: 'Topup awal',
        createdon: new Date(),
        updatedon: new Date(),
        createdby: 'admin',
        updatedby: 'admin',
      },
      {
        walletid: 1,
        username: 'anis',
        amount: 250000,
        status: 'pending',
        remarks: 'Topup kedua',
        createdon: new Date(),
        updatedon: new Date(),
        createdby: 'admin',
        updatedby: 'admin',
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('topups', null, {});
  }
};
