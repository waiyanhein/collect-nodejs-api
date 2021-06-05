'use strict';
const authService = require('../services/authService.js');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    let now = new Date();

    await queryInterface.bulkInsert('Users', [
      {
        name: "tester",
        email: "tester@gmail.com",
        password: authService.hashPassword("password1234"),
        createdAt: now,
        updatedAt: now,
        verifiedAt: now
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete("Users", null, { });
  }
};
