'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('withdraws', [
      {
        walletid: 1,
        username: 'anis',
        amount: 50000,
        status: 'success',
        remarks: 'Penarikan pertama',
        createdon: new Date(),
        updatedon: new Date(),
        createdby: 'admin',
        updatedby: 'admin',
      },
      {
        walletid: 1,
        username: 'anis',
        amount: 30000,
        status: 'failed',
        remarks: 'Saldo tidak cukup',
        createdon: new Date(),
        updatedon: new Date(),
        createdby: 'admin',
        updatedby: 'admin',
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('withdraws', null, {});
  }
};
