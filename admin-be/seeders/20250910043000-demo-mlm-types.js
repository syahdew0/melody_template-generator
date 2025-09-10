'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('mlmtypes', [
      { MLMTypeID: 1, MLMTypeName: 'Binary', IsActive: true },
      // kalau mau tambahan:
      // { MLMTypeID: 2, MLMTypeName: 'Unilevel', IsActive: false },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('mlmtypes', null, {});
  }
};

