'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('post_types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Opsional: insert default types
    await queryInterface.bulkInsert('post_types', [
      { name: 'post', created_at: new Date(), updated_at: new Date() },
      { name: 'page', created_at: new Date(), updated_at: new Date() },
      { name: 'product', created_at: new Date(), updated_at: new Date() },
      { name: 'testimonial', created_at: new Date(), updated_at: new Date() },
      { name: 'custom_page', created_at: new Date(), updated_at: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('post_types');
  }
};
