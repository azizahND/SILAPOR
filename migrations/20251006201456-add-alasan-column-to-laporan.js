"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Laporans", "alasan", {
      type: Sequelize.STRING,
      allowNull: true, // Kolom alasan bisa kosong
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Laporans", "alasan");
  },
};
