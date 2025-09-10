'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mlmtypedetails', {
      MLMTypeDetailID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      MLMTypeID: { type: Sequelize.INTEGER, allowNull: false },
      MLMPositionID: { type: Sequelize.INTEGER, allowNull: false },
      Value: { type: Sequelize.DOUBLE, allowNull: false },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('mlmtypedetails');
  }
};

