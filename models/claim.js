"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Claim extends Model {
    static associate(models) {
      Claim.belongsTo(models.User, {
        foreignKey: "email",
        targetKey: "email",
      });

      Claim.belongsTo(models.Laporan, {
        foreignKey: "id_laporan",
      });
    }
  }

  Claim.init(
    {
      id_claim: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_laporan: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tanggal_claim: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      status: {
        
        type: DataTypes.ENUM("Waiting for approval", "Rejected", "Done"),
        allowNull: false,
        defaultValue: "Waiting for approval",
      },
      alasan: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Claim",
      tableName: "Claim",
      timestamps: false,
    }
  );

  return Claim;
};