'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Laporans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      barangId: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: {
          model: 'Barangs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      komunikasiId: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: {
          model: 'Komunikasis',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      tanggalLaporan: Sequelize.DATE,
      keterangan: Sequelize.TEXT,
      statusLaporan: Sequelize.ENUM('Baru', 'Diproses', 'Selesai'),
      tipeLaporan: Sequelize.ENUM('Hilang', 'Temuan'),
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
    await queryInterface.dropTable('Laporans');
  }
};
