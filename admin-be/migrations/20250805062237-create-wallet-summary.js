'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wallet_summaries', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      summary_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      // wallet_id: {
      //   type: Sequelize.BIGINT,
      //   allowNull: false,
      // },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      transaction_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Indexes
    await queryInterface.addIndex('wallet_summaries', ['summary_date']);
    await queryInterface.addIndex('wallet_summaries', ['wallet_id']);
    await queryInterface.addIndex('wallet_summaries', ['username']);
    await queryInterface.addIndex('wallet_summaries', ['transaction_type_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('wallet_summaries');
  }
};
