'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('mlmsettings', [
      {
        MaxHariTransaksi: 2,
        MaxIklanPerHari: 0,
        AutoApprove: false,
        SamePackage: false,
        AutoHold: false,
        MaxChild: 4,
        Positions: JSON.stringify([
          { name: 'Left', value: 10 },
          { name: 'Right', value: 10 }
        ]),
        Wallets: JSON.stringify([
          { name: 'Saldo', percent: 30, active: true },
          { name: 'Point', percent: 40, active: true },
          { name: 'Stamp', percent: 30, active: true }
        ]),
        CreatedOn: new Date(),
        CreatedBy: 'system',
        UpdatedOn: new Date(),
        UpdatedBy: 'system'
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('mlmsettings', null, {});
  }
};
