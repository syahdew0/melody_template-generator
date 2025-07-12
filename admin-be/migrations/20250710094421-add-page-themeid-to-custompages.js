'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('custom_pages', 'page', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'tag', // Optional: hanya MySQL
    });

    await queryInterface.addColumn('custom_pages', 'theme_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'themes',
        key: 'id',
      },
      onUpdate: 'NO ACTION',
      onDelete: 'SET NULL',
      after: 'page', 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('custom_pages', 'page');
    await queryInterface.removeColumn('custom_pages', 'theme_id');
  },
};
