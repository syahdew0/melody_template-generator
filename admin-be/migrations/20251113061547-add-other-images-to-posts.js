'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('posts', 'other_images', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      after: 'thumbnail_url', 
      comment: 'Array of additional image URLs in JSON format'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('posts', 'other_images');
  }
};
