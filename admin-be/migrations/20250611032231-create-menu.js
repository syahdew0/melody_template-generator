'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menus', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      path: { type: Sequelize.STRING, allowNull: true },
      parent_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'menus', key: 'id' }, onDelete: 'CASCADE' },
      order: { type: Sequelize.INTEGER, defaultValue: 0 },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('menus');
  }
};
