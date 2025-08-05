'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('company_banks', [
      {
        bank_name: 'Bank BCA',
        account_name: 'PT Phisoft',
        account_number: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bank_name: 'Bank Mandiri',
        account_name: 'PT Phisoft',
        account_number: '9876543210',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bank_name: 'Bank BRI',
        account_name: 'PT Phisoft',
        account_number: '111122223333',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('company_banks', null, {});
  }
};

