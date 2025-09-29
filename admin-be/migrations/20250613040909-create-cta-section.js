'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CtaSections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      badgeText: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mainTitle1: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mainTitle2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subtitle: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      whatsappNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      portfolioButtonText: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      portfolioLink: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      whatsappButtonText: {
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CtaSections');
  },
};
