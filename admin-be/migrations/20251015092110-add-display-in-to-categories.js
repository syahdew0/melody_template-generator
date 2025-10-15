'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // pastikan kolom sudah ada dan unsigned
    await queryInterface.changeColumn('categories', 'display_in', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint('categories', {
      fields: ['display_in'],
      type: 'foreign key',
      name: 'fk_categories_display_in_post_types',
      references: {
        table: 'post_types',
        field: 'id'
      },
      onUpdate: 'NO ACTION',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('categories', 'fk_categories_display_in_post_types');
  }
};
