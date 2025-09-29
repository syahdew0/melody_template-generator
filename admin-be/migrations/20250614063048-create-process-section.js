'use strict';

/** @type {import('sequelize-cli').Migration} */
// migrations/20250929103500-create-process-section.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProcessSections', {
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
      mainTitle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subtitle: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ctaText: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ctaLink: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      steps: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProcessSections');
  },
};