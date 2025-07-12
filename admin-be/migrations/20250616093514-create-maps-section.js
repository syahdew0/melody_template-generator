'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MapsSections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: Sequelize.STRING,
      description: Sequelize.TEXT,
      mapUrl: Sequelize.TEXT,
      mapEmbedUrl: Sequelize.TEXT,
      buttonMapText: Sequelize.STRING,
      buttonShareText: Sequelize.STRING,
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

    // Insert default empty row
    await queryInterface.bulkInsert('MapsSections', [{
      title: '',
      description: '',
      mapUrl: '',
      mapEmbedUrl: '',
      buttonMapText: '',
      buttonShareText: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MapsSections');
  }
};