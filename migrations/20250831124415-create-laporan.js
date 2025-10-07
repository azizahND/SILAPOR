"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Laporans", {
      id_laporan: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      email: {
        type: Sequelize.STRING,
        references: {
          model: "Users",
          key: "email",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      jenis_laporan: {
        type: Sequelize.ENUM,
        values: ["Penemuan", "Kehilangan"],
      },
      nama_barang: {
        type: Sequelize.STRING,
      },
      tanggal_kejadian: {
        type: Sequelize.DATE,
      },
      lokasi: {
        type: Sequelize.STRING,
      },
      tanggal_laporan: {
        type: Sequelize.DATE,
      },
      deskripsi: {
        type: Sequelize.TEXT,
      },
      foto_barang: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM,
        values: [
          "Waiting for upload verification",
          "Upload verification rejected",
          "On progress",
          "Claimed",
          "Waiting for end verification",
          "End verification rejected",
          "Done",
        ],
      },
      tanggal_penyerahan: {
        type: Sequelize.DATE,
      },
      lokasi_penyerahan: {
        type: Sequelize.STRING,
      },
      foto_bukti: {
        type: Sequelize.STRING,
      },
      verifikasi_action: {
        type: Sequelize.ENUM,
        values: ["none", "approve", "denied"],
      },
      alasan: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      pengklaim: {
        type: Sequelize.STRING,
      },
      no_hp_pengklaim: {
        type: Sequelize.STRING(50),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Laporans");
  },
};
