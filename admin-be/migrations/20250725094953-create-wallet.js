'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wallets', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id',
        },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION',
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      wallet_type: {
        type: Sequelize.ENUM('saldo', 'poin', 'stamp'),
        allowNull: false,
        defaultValue: 'saldo',
      },
      // balance: {
      //   type: Sequelize.DECIMAL(15, 2),
      //   allowNull: false,
      //   defaultValue: 0,
      // },
      createdon: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedon: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('wallets', ['username']);
    await queryInterface.addIndex('wallets', ['wallet_type']);
    await queryInterface.addIndex('wallets', ['customer_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('wallets');
  },
};
