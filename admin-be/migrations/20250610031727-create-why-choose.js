'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WhyChooseUs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // Kolom umum
      title: {
        type: Sequelize.STRING
      },
      subtitle: {
        type: Sequelize.TEXT
      },
      desc: {
        type: Sequelize.TEXT
      },
      icon: {
        type: Sequelize.STRING
      },
      // Kolom untuk membedakan jenis: 'header' atau 'benefit'
      type: {
        type: Sequelize.ENUM('header', 'benefit'),
        defaultValue: 'benefit'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WhyChooseUs')
  }
}
