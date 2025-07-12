'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FooterSettings', {
      id: {
        allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER
      },
      logo: Sequelize.STRING,
      brand: Sequelize.STRING,
      description: Sequelize.TEXT,
      navigation: Sequelize.JSON,
      contact: Sequelize.JSON,
      socials: Sequelize.JSON,
      layoutOptions: Sequelize.JSON,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('FooterSettings')
  }
}

