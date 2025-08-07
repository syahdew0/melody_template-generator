'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('topups', 'bank_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'company_banks',
        key: 'id'
      },
      onUpdate: 'NO ACTION',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('topups', 'bank_id');
  }
};
