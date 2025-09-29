'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'RoleId', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'roles', // tabel referensi
        key: 'id',
      },
      onUpdate: 'NO ACTION',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'RoleId');
  },
};