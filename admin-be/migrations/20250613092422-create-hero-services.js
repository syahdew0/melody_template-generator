'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('HeroServices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      headingTitle: {
        type: Sequelize.STRING,
      },
      headingSubtitle: {
        type: Sequelize.STRING,
      },
      cta1Label: {
        type: Sequelize.STRING,
      },
      cta1Link: {
        type: Sequelize.STRING,
      },
      cta2Label: {
        type: Sequelize.STRING,
      },
      cta2Path: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('HeroServices');
  }
};
