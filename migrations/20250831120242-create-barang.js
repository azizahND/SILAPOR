'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Barangs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      namaBarang: Sequelize.STRING,
      deskripsi: Sequelize.TEXT,
      kategori: Sequelize.ENUM('Elektronik', 'Furnitur', 'Lainnya'),
      tanggalInput: Sequelize.DATE,
      tanggalTemuan: Sequelize.DATE,
      lokasi: Sequelize.STRING,
      status: Sequelize.ENUM('Hilang', 'Ditemukan'),
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('Barangs');
  }
};
