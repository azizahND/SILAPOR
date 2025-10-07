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
          password: await bcrypt.hash('admin123', 10), 
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
          isVerified: 1
        }
      ]);
    },

    async down (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('Users', null, {});
    }
  };
