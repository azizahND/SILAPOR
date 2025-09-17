'use strict';

module.exports = (sequelize, DataTypes) => {
  const Laporan = sequelize.define('Laporan', {
    id_laporan: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'email',
      },
    },
    jenis_laporan: {
      type: DataTypes.ENUM('Penemuan', 'Kehilangan'),
      allowNull: false,
    },
    nama_barang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tanggal_kejadian: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lokasi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tanggal_laporan: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    foto_barang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        'Waiting for upload verification',
        'Upload verification rejected',
        'On progress',
        'Claimed',
        'Waiting for end verification',
        'End verification rejected',
        'Done'
      ),
      defaultValue: 'Waiting for upload verification',
    },
    tanggal_penyerahan: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lokasi_penyerahan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    foto_bukti: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verifikasi_action: {
      type: DataTypes.ENUM('none', 'approve', 'denied'),
      defaultValue: 'none',
    },
    pengklaim: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_hp_pengklaim: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  }, {
    tableName: 'Laporans',  
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: false
  });

  Laporan.associate = function(models) {
    Laporan.belongsTo(models.User, { foreignKey: 'email', targetKey: 'email' });
  };

  return Laporan;
};
