'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mlmtypes', {
      MLMTypeID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      MLMTypeName: { type: Sequelize.STRING(100), allowNull: false },
      IsActive: { type: Sequelize.BOOLEAN, defaultValue: false },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('mlmtypes');
  }
};
