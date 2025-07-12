'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('newsletter_settings', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      placeholder: { type: Sequelize.STRING, allowNull: true },
      button: { type: Sequelize.STRING, allowNull: true },
      submitting: { type: Sequelize.STRING, allowNull: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('newsletter_settings');
  }
};
