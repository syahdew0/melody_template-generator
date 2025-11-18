'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE posts 
      MODIFY COLUMN type 
      ENUM('post', 'page', 'product', 'testimonial', 'custom_page', 'listing') 
      DEFAULT 'post';
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE posts 
      MODIFY COLUMN type 
      ENUM('post', 'page', 'product', 'testimonial', 'custom_page') 
      DEFAULT 'post';
    `);
  }
};
