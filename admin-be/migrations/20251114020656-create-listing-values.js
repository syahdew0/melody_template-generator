'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('listing_values', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER.UNSIGNED
    },
    post_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'listings', key: 'post_id' },
      onUpdate: 'NO ACTION',
      onDelete: 'NO ACTION'
    },
    tag_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    language_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    value: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
    });


  await queryInterface.addIndex('listing_values', ['post_id']);
    await queryInterface.addIndex('listing_values', ['tag_name']);
    },


  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('listing_values');
  }
};