'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false
    }

  }, {});
  
  User.associate = function(models) {
    User.hasMany(models.Komunikasi, { foreignKey: 'userId' });
    User.hasMany(models.Laporan, { foreignKey: 'userId' });
    User.hasMany(models.Notifikasi, { foreignKey: 'userId' });
  };
  
  return User;
};
