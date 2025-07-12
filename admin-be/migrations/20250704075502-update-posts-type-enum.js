'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE posts MODIFY COLUMN type ENUM('post', 'page', 'product', 'testimonial', 'custom_page') DEFAULT 'post'
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE posts MODIFY COLUMN type ENUM('post', 'page', 'product', 'testimonial') DEFAULT 'post'
    `);
  }
};
