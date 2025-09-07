'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Aktifitas', {
      id_aktivitas: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      email: {
        type: Sequelize.STRING,
        references: {
          model: 'Users',
          key: 'email'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      deskripsi_aktivitas: {
        type: Sequelize.STRING(255)
      },
      tanggal_aktivitas: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Aktifitas');
  }
};
