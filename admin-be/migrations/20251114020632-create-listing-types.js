'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
async up (queryInterface, Sequelize) {
  await queryInterface.createTable('listing_types', {
   id: {
  type: Sequelize.INTEGER.UNSIGNED,
  autoIncrement: true,
  primaryKey: true
},
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    parameter: {
      type: Sequelize.JSON,
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
    },

async down (queryInterface, Sequelize) {
  await queryInterface.dropTable('listing_types');
}
};