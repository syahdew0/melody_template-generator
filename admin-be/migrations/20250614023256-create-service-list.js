'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ServiceLists', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      type: Sequelize.STRING,
      title: Sequelize.STRING,
      title2: Sequelize.STRING,
      description: Sequelize.TEXT,
      ctaNote: Sequelize.STRING,
      ctaLabel1: Sequelize.STRING,
      ctaPath1: Sequelize.STRING,
      ctaLabel2: Sequelize.STRING,
      ctaPath2: Sequelize.STRING,
      icon: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ServiceLists')
  }
}