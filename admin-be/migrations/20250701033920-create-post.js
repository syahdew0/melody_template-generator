'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      website_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'websites',
          key: 'id',
        },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      content: Sequelize.TEXT,
      excerpt: Sequelize.TEXT,
      thumbnail_url: Sequelize.STRING,
      type: {
        type: Sequelize.ENUM('post', 'page', 'product', 'testimonial',),
        defaultValue: 'post'
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'trash'),
        defaultValue: 'draft'
      },
      template: Sequelize.STRING,
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      published_at: Sequelize.DATE,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('posts');
  }
};


