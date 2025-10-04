'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('postmeta', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      post_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        // Kalau mau, bisa aktifkan foreign key ke posts
        // references: {
        //   model: 'posts',
        //   key: 'id',
        // },
        // onUpdate: 'CASCADE',
        // onDelete: 'CASCADE',
      },
      meta_key: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      meta_value: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('postmeta');
  }
};
