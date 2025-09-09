'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Packages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      days: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      shares: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      roi: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      roi_percent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      value: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      bonus_referral: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      pairing: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      max_pairing: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      other_matching: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      skip_suspended: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      suspended: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      matchings: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      random_matchings: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      include_matching_random: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Packages');
  },
};

