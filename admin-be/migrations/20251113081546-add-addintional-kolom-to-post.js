'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('posts', 'additional_kolom1', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('posts', 'additional_kolom2', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('posts', 'additional_kolom3', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('posts', 'additional_kolom4', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('posts', 'additional_kolom5', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('posts', 'additional_kolom1');
    await queryInterface.removeColumn('posts', 'additional_kolom2');
    await queryInterface.removeColumn('posts', 'additional_kolom3');
    await queryInterface.removeColumn('posts', 'additional_kolom4');
    await queryInterface.removeColumn('posts', 'additional_kolom5');
  }
};