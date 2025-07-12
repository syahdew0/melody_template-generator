'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('custom_pages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: Sequelize.TEXT,
      description: Sequelize.TEXT,
      tag: Sequelize.STRING,
      image: Sequelize.STRING,
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_by: Sequelize.STRING,
      updated_by: Sequelize.STRING,
      parent_id: Sequelize.INTEGER,
      items: Sequelize.JSON,
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('custom_pages');
  },
};

