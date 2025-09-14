'use strict';
module.exports = (sequelize, DataTypes) => {
  const Aktifitas = sequelize.define('Aktifitas', {
    id_aktivitas: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    deskripsi_aktivitas: {
      type: DataTypes.STRING(255)
    },
    tanggal_aktivitas: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'Aktifitas',
    timestamps: true
  });

  Aktifitas.associate = function(models) {
    Aktifitas.belongsTo(models.User, { 
      foreignKey: 'email', 
      targetKey: 'email',
      as: 'user'
    });
  };

  return Aktifitas;
};
