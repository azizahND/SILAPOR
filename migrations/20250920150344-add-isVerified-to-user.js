'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
up: async (queryInterface, Sequelize) => {
  await queryInterface.addColumn('Users', 'isVerified', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
  await queryInterface.addColumn('Users', 'emailVerifyToken', {
    type: Sequelize.STRING,
    allowNull: true,
  });
  await queryInterface.addColumn('Users', 'emailVerifyTokenUsed', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
},
down: async (queryInterface, Sequelize) => {
  await queryInterface.removeColumn('Users', 'isVerified');
  await queryInterface.removeColumn('Users', 'emailVerifyToken');
  await queryInterface.removeColumn('Users', 'emailVerifyTokenUsed');
}
};
