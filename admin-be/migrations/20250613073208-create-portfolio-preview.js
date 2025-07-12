'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PortfolioPreviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      hero: {
        // type: Sequelize.JSONB,
        type: Sequelize.TEXT,
        allowNull: false
      },
      cta: {
        // type: Sequelize.JSONB,
        type: Sequelize.TEXT,
        allowNull: false
      },
      projects: {
        // type: Sequelize.JSONB,
        type: Sequelize.TEXT,
        allowNull: false
      },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('PortfolioPreviews');
  }
};