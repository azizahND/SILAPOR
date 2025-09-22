'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('claim', {
      id_claim: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_laporan: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
        model: "Laporans",
        key: "id_laporan",
        },
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        references: {
        model: "Users",
        key: "email",
        },
      },
      tanggal_claim: {
        type: Sequelize.DATEONLY,
        allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('claim');
  }
};
