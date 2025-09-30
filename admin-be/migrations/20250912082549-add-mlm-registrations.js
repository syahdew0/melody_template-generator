'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tambah kolom placement_pos
    await queryInterface.addColumn('mlm_registrations', 'placement_pos', {
      type: Sequelize.ENUM('left', 'right', 'center'),
      allowNull: true,
      comment: 'Posisi anak di bawah upline (kiri/kanan/center)',
    });

    // Tambah kolom referral_id
    await queryInterface.addColumn('mlm_registrations', 'referral_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Customers',
        key: 'id',
      },
      onUpdate: 'NO ACTION',
      onDelete: 'SET NULL',
      comment: 'Siapa yang mendaftarkan user',
    });

    // Tambah kolom mlm_level
    await queryInterface.addColumn('mlm_registrations', 'mlm_level', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Level user dalam tree MLM',
    });

    // Tambah kolom points_left
    await queryInterface.addColumn('mlm_registrations', 'points_left', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total poin anak kiri',
    });

    // Tambah kolom points_right
    await queryInterface.addColumn('mlm_registrations', 'points_right', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total poin anak kanan',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('mlm_registrations', 'placement_pos');
    await queryInterface.removeColumn('mlm_registrations', 'referral_id');
    await queryInterface.removeColumn('mlm_registrations', 'mlm_level');
    await queryInterface.removeColumn('mlm_registrations', 'points_left');
    await queryInterface.removeColumn('mlm_registrations', 'points_right');
  },
};
