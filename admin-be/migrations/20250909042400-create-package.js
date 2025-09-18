'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mlmpackages', {
      MLMPackageID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      MLMPackageName: { type: Sequelize.STRING(100), allowNull: false },
      Days: { type: Sequelize.INTEGER, allowNull: false },
      PackageValue: { type: Sequelize.DOUBLE, allowNull: false },
      ReferralBonus: { type: Sequelize.DOUBLE, defaultValue: 0 },
      ROI: { type: Sequelize.DOUBLE, allowNull: false },
      Pairing: { type: Sequelize.DOUBLE, allowNull: false },
      Priority: { type: Sequelize.INTEGER,defaultValue: 0},
      Shares: { type: Sequelize.INTEGER, defaultValue: 0},
      MaxPairing: { type: Sequelize.DOUBLE, allowNull: false },
      OtherMatching: { type: Sequelize.DOUBLE, allowNull: false },
      MatchingLevel: { type: Sequelize.INTEGER, allowNull: false },
      RandomLevel: { type: Sequelize.INTEGER, defaultValue: 0 },
      TicketNumber: { type: Sequelize.INTEGER, defaultValue: 0 },
      IsSuspend: { type: Sequelize.BOOLEAN, defaultValue: false },
      SkipSuspended: { type: Sequelize.BOOLEAN, defaultValue: false }, 
      SkipSuspendedOption: { 
        type: Sequelize.ENUM('skip', 'pass_up', 'random'), 
        defaultValue: 'skip' 
      },
      Description: { type: Sequelize.TEXT },
      CreatedOn: { type: Sequelize.DATE, allowNull: false },
      CreatedBy: { type: Sequelize.STRING(50), allowNull: false },
      UpdateOn: { type: Sequelize.DATE, allowNull: false },
      UpdateBy: { type: Sequelize.STRING(50), allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('mlmpackages');
  },
};
