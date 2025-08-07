'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('userdailywallets', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      wallet_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      daily_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      starting_balance: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      total_in: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      total_out: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      ending_balance: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // optional: tambahkan constraint unik
    await queryInterface.addConstraint('userdailywallets', {
      fields: ['username', 'wallet_id', 'daily_date'],
      type: 'unique',
      name: 'unique_user_wallet_per_day'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('userdailywallets');
  }
};
