'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'foto', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'default.jpg',  // Foto default jika tidak di-upload
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'foto');
  },
};

