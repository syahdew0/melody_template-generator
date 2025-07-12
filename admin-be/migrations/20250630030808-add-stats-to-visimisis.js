'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('VisiMisis');
    if (!tableDefinition.stats) {
      await queryInterface.addColumn('VisiMisis', 'stats', {
        type: Sequelize.JSON,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('VisiMisis');
    if (tableDefinition.stats) {
      await queryInterface.removeColumn('VisiMisis', 'stats');
    }
  }
};
