'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('listings', {
      post_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
        references: { model: 'posts', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      listing_type: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true, 
        references: { model: 'listing_types', key: 'id' },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },

      price: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: true
      },
      kondisi: {
        type: Sequelize.STRING,
        allowNull: true
      },
      latitude: {
        type: Sequelize.DECIMAL(10,8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11,8),
        allowNull: true
      },
      provinsi: {
        type: Sequelize.STRING,
        allowNull: true
      },
      kabupaten: {
        type: Sequelize.STRING,
        allowNull: true
      },
      kecamatan: {
        type: Sequelize.STRING,
        allowNull: true
      },
      kelurahan: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('listings');
  }
};
