'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ServiceLists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      title2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ctaNote: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ctaLabel1: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ctaPath1: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ctaLabel2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ctaPath2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ServiceLists');
  },
};