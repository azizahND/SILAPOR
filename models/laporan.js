"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Laporan extends Model {
    static associate(models) {
      Laporan.belongsTo(models.User, {
        foreignKey: "email",
        targetKey: "email",
      });

      Laporan.hasMany(models.Claim, {
        foreignKey: "id_laporan",
      });
    }
  }

  Laporan.init(
    {
      id_laporan: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      jenis_laporan: {
        type: DataTypes.ENUM("Penemuan", "Kehilangan"),
        allowNull: false,
      },
      nama_barang: DataTypes.STRING,
      tanggal_kejadian: DataTypes.DATE,
      lokasi: DataTypes.STRING,
      tanggal_laporan: DataTypes.DATE,
      deskripsi: DataTypes.TEXT,
      foto_barang: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM(
          "Waiting for upload verification",
          "Upload verification rejected",
          "On progress",
          "Claimed",
          "Waiting for end verification",
          "End verification rejected",
          "Done"
        ),
        defaultValue: "Waiting for upload verification",
      },
      tanggal_penyerahan: DataTypes.DATE,
      lokasi_penyerahan: DataTypes.STRING,
      foto_bukti: DataTypes.STRING,
      verifikasi_action: {
        type: DataTypes.ENUM("none", "approve", "denied"),
        defaultValue: "none",
      },
      pengklaim: DataTypes.STRING,
      no_hp_pengklaim: DataTypes.STRING(50),
      alasan: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: "Laporan",
      tableName: "Laporans",
      timestamps: true,
    }
  );

  return Laporan;
};
