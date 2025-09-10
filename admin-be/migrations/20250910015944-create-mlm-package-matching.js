'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mlmpackagematchings', {
      MLMPackageMatchingID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      MLMPackageID: { type: Sequelize.INTEGER, allowNull: false },
      Level: { type: Sequelize.INTEGER, allowNull: false },
      Percentage: { type: Sequelize.DOUBLE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('mlmpackagematchings');
  },
};
