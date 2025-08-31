'use strict';
module.exports = (sequelize, DataTypes) => {
  const Komunikasi = sequelize.define('Komunikasi', {
    userId: DataTypes.INTEGER,
    tanggal: DataTypes.DATE,
    pesan: DataTypes.TEXT,
    tipe: DataTypes.ENUM('Admin', 'User')
  }, {});

  Komunikasi.associate = function(models) {
    Komunikasi.belongsTo(models.User, { foreignKey: 'userId' });
    Komunikasi.hasMany(models.Laporan, { foreignKey: 'komunikasiId' });
  };

  return Komunikasi;
};
