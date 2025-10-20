'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('menu_items', 'open_in_new_tab', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Tanda apakah link dibuka di tab baru',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('menu_items', 'open_in_new_tab');
  }
};
