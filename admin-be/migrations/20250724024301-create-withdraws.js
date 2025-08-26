'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('withdraws', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed','canceled',),
        defaultValue: 'pending',
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      walletid: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reference_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      remarks: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdon: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      createdby: {
        type: Sequelize.STRING,
        allowNull: false
      },
      updatedon: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updatedby: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('withdraws');
  },
};
