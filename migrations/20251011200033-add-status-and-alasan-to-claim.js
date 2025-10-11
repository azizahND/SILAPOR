"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Claim", "status", {
      type: Sequelize.ENUM("waiting for approval", "rejected"),
      allowNull: false,
      defaultValue: "waiting for approval",
    });
    await queryInterface.addColumn("Claim", "alasan", {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Claim", "status");
    await queryInterface.removeColumn("Claim", "alasan");
  },
};
