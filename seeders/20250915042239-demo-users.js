'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [
      {
        nama: 'Admin Sistem',
        email: 'admin@silapor.com',
        no_telepon: '081234567890',
        alamat: 'Padang, Indonesia',
        password: await bcrypt.hash('admin123', 10), // hash password
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'budi',
        email: 'budi@silapor.com',
        no_telepon: '089876543210',
        alamat: 'Bukittinggi, Indonesia',
        password: await bcrypt.hash('user123', 10),
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
