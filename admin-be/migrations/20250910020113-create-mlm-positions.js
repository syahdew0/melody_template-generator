'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mlmpositions', {
      MLMPositionID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      MLMPositionName: { type: Sequelize.STRING(100), allowNull: false },
      Value: { type: Sequelize.DOUBLE },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('mlmpositions');
  },
};
