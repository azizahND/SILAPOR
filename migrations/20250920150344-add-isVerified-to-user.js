'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
up: async (queryInterface, Sequelize) => {
  return queryInterface.addColumn('Users', 'isVerified', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
},
down: async (queryInterface, Sequelize) => {
  return queryInterface.removeColumn('Users', 'isVerified');
}
};
