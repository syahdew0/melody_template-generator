'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('mlmpositions', [
      { MLMPositionID: 1, MLMPositionName: 'Left', Value: 1 },
      { MLMPositionID: 2, MLMPositionName: 'Right', Value: 1 },
      // kalau nanti butuh Mid:
      // { MLMPositionID: 3, MLMPositionName: 'Mid1', Value: 1 },
      // { MLMPositionID: 4, MLMPositionName: 'Mid2', Value: 1 },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('mlmpositions', null, {});
  }
};
