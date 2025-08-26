'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wallet_histories', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      walletId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      transaction_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      wallet_type: {
        type: Sequelize.ENUM('saldo', 'point', 'stamp'),
        allowNull: false,
        defaultValue: 'saldo',
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      balance_before: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      balance_after: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      remarks: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed', 'canceled'),
        allowNull: false,
        defaultValue: 'success',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('wallet_histories', ['walletId']);
    await queryInterface.addIndex('wallet_histories', ['username']);
    await queryInterface.addIndex('wallet_histories', ['transaction_type_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('wallet_histories');
  },
};
