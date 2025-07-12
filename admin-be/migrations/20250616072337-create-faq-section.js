'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FaqSections', {
      id: {
        allowNull: false, autoIncrement: true, primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: { type: Sequelize.STRING },
      subtitle: { type: Sequelize.STRING },
      ctaText: { type: Sequelize.STRING },
      ctaLink: { type: Sequelize.STRING },
      faqs: { type: Sequelize.TEXT }, // JSON stringified
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FaqSections');
  }
};
