'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('mlmtypedetails', [
      { MLMTypeDetailID: 1, MLMTypeID: 1, MLMPositionID: 1, Value: 1 }, // Binary - Left
      { MLMTypeDetailID: 2, MLMTypeID: 1, MLMPositionID: 2, Value: 1 }, // Binary - Right
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('mlmtypedetails', null, {});
  }
};
