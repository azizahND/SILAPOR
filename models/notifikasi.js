'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notifikasi = sequelize.define('Notifikasi', {
    userId: DataTypes.INTEGER,
    laporanId: DataTypes.INTEGER,
    pesan: DataTypes.TEXT,
    status: DataTypes.ENUM('Unread', 'Read')
  }, {});

  Notifikasi.associate = function(models) {
    Notifikasi.belongsTo(models.User, { foreignKey: 'userId' });
    Notifikasi.belongsTo(models.Laporan, { foreignKey: 'laporanId' });
  };

  return Notifikasi;
};
