'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      menu_group_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'menu_groups',
          key: 'id',
        },
        onUpdate: 'NO ACTION',
        onDelete: 'SET NULL'
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('menu_items');
  }
};
