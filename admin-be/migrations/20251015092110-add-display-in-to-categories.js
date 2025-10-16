'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
  
    await queryInterface.addColumn('categories', 'display_in', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint('categories', {
      fields: ['display_in'],
      type: 'foreign key',
      name: 'fk_categories_display_in_post_types',
      references: {
        table: 'post_types',
        field: 'id',
      },
      onUpdate: 'NO ACTION',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    // Hapus constraint
    await queryInterface.removeConstraint('categories', 'fk_categories_display_in_post_types');
    // Hapus kolom
    await queryInterface.removeColumn('categories', 'display_in');
  },
};
