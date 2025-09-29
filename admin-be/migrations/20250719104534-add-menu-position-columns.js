'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('menu_groups');

    if (!tableDesc.is_main) {
      await queryInterface.addColumn('menu_groups', 'is_main', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    if (!tableDesc.is_footer) {
      await queryInterface.addColumn('menu_groups', 'is_footer', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    if (!tableDesc.is_top) {
      await queryInterface.addColumn('menu_groups', 'is_top', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  down: async (queryInterface) => {
    const tableDesc = await queryInterface.describeTable('menu_groups');

    if (tableDesc.is_main) await queryInterface.removeColumn('menu_groups', 'is_main');
    if (tableDesc.is_footer) await queryInterface.removeColumn('menu_groups', 'is_footer');
    if (tableDesc.is_top) await queryInterface.removeColumn('menu_groups', 'is_top');
  }
};
