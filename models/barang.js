'use strict';
module.exports = (sequelize, DataTypes) => {
  const Barang = sequelize.define('Barang', {
    namaBarang: DataTypes.STRING,
    deskripsi: DataTypes.TEXT,
    kategori: DataTypes.ENUM('Elektronik', 'Furnitur', 'Lainnya'),
    tanggalInput: DataTypes.DATE,
    tanggalTemuan: DataTypes.DATE,
    lokasi: DataTypes.STRING,
    status: DataTypes.ENUM('Hilang', 'Ditemukan'),
    userId: DataTypes.INTEGER
  }, {});

  Barang.associate = function(models) {
    Barang.belongsTo(models.User, { foreignKey: 'userId' });
    Barang.hasMany(models.Laporan, { foreignKey: 'barangId' });
  };

  return Barang;
};
