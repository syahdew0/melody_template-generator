'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mlmsettings', {
      MLMSettingID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      MaxHariTransaksi: { type: Sequelize.INTEGER, defaultValue: 2 },
      MaxIklanPerHari: { type: Sequelize.INTEGER, defaultValue: 0 },
      AutoApprove: { type: Sequelize.BOOLEAN, defaultValue: false },
      SamePackage: { type: Sequelize.BOOLEAN, defaultValue: false },
      AutoHold: { type: Sequelize.BOOLEAN, defaultValue: false },
      MaxChild: { type: Sequelize.INTEGER, defaultValue: 4 },
      BonusSource: { 
        type: Sequelize.ENUM('downline', 'upline'),
        defaultValue: 'downline',
      },
      Positions: { type: Sequelize.JSON, defaultValue: JSON.stringify([
        { name: 'Left', value: 10 },
        { name: 'Right', value: 10 }
      ]) },
      Wallets: { type: Sequelize.JSON, defaultValue: JSON.stringify([
        { name: 'MLM BALANCE', percent: 30, active: true },
        { name: 'MLM WD', percent: 70, active: true }
      ]) },
      CreatedOn: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      CreatedBy: { type: Sequelize.STRING, defaultValue: 'system' },
      UpdatedOn: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      UpdatedBy: { type: Sequelize.STRING, defaultValue: 'system' },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('mlmsettings');
  }
};


// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable('MLMSettings', {
//       id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       maxHariTransaksi: {
//         type: Sequelize.INTEGER,
//         defaultValue: 2,
//       },
//       maxIklanPerHari: {
//         type: Sequelize.INTEGER,
//         defaultValue: 0,
//       },
//       autoApprove: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false,
//       },
//       samePackage: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false,
//       },
//       autoHold: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false,
//       },
//       maxChild: {
//         type: Sequelize.INTEGER,
//         defaultValue: 2,
//       },
//       positions: {
//         type: Sequelize.JSON,
//         defaultValue: [],
//       },
//       wallets: {
//         type: Sequelize.JSON,
//         defaultValue: [],
//       },
//       createdAt: {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
//       },
//       updatedAt: {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
//       },
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.dropTable('MLMSettings');
//   },
// };
