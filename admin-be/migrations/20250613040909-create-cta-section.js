'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CtaSections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      badgeText: Sequelize.STRING,
      mainTitle1: Sequelize.STRING,
      mainTitle2: Sequelize.STRING,
      subtitle: Sequelize.TEXT,
      whatsappNumber: Sequelize.STRING,
      portfolioButtonText: Sequelize.STRING,
      portfolioLink: Sequelize.STRING,
      whatsappButtonText: Sequelize.STRING,

      // Tambahan field tombol CTA
      cta1Label: Sequelize.STRING,
      cta1Link: Sequelize.STRING,
      cta2Label: Sequelize.STRING,
      cta2Path: Sequelize.STRING,

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('CtaSections')
  },
};
