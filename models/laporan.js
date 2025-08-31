'use strict';
module.exports = (sequelize, DataTypes) => {
  const Laporan = sequelize.define('Laporan', {
    userId: DataTypes.INTEGER,
    barangId: DataTypes.INTEGER,
    komunikasiId: DataTypes.INTEGER,
    tanggalLaporan: DataTypes.DATE,
    keterangan: DataTypes.TEXT,
    statusLaporan: DataTypes.ENUM('Baru', 'Diproses', 'Selesai'),
    tipeLaporan: DataTypes.ENUM('Hilang', 'Temuan')
  }, {});

  Laporan.associate = function(models) {
    Laporan.belongsTo(models.User, { foreignKey: 'userId' });
    Laporan.belongsTo(models.Barang, { foreignKey: 'barangId' });
    Laporan.belongsTo(models.Komunikasi, { foreignKey: 'komunikasiId' });
    Laporan.hasMany(models.Notifikasi, { foreignKey: 'laporanId' });
  };

  return Laporan;
};
