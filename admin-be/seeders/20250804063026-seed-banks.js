'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('banks', [
      { name: 'BCA', status: 'active', created_at: new Date() },
      { name: 'BRI', status: 'active', created_at: new Date() },
      { name: 'Mandiri', status: 'active', created_at: new Date() },
      { name: 'BNI', status: 'inactive', created_at: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('banks', null, {});
  }
};
