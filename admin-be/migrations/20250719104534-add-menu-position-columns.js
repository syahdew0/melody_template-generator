'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('menu_groups', 'is_main', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('menu_groups', 'is_footer', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('menu_groups', 'is_top', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('menu_groups', 'is_main');
    await queryInterface.removeColumn('menu_groups', 'is_footer');
    await queryInterface.removeColumn('menu_groups', 'is_top');
  }
};
