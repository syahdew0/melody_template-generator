'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('starting_balances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      username: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      date: {
        type: Sequelize.DATE, 
        allowNull: false
      },
      balance: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0
      },
      wallet_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('starting_balances');
  }
};
