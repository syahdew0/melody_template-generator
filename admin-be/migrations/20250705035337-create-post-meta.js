'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post_categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED 
      },
      post_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        // references: {
        //   model: 'posts',
        //   key: 'id',
        // },
        // onUpdate: 'NO ACTION',
        // onDelete: 'NO ACTION',
      },
      meta_key: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      meta_value: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('post_categories');
  }
};