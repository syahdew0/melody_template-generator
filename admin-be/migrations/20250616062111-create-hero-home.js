'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HeroHomes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'static', // sesuai default yang kamu kasih
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subtitle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      highlight: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ctaText: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ctaLink: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      slides: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: 1,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('HeroHomes');
  },
};