'use strict';

/** @type {import('sequelize-cli').Migration} */
// migrations/20250929111000-create-contact-heros.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ContactHeros', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subtitle: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      cta1Text: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cta1Link: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cta2Text: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cta2Path: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('ContactHeros');
  },
};