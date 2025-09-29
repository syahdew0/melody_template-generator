'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Hero_services', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      headingTitle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      headingSubtitle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cta1Label: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cta1Link: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cta2Label: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cta2Path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Hero_services');
  },
};