'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FaqSections', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      subtitle: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      ctaText: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      ctaLink: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      faqs: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FaqSections');
  },
};
