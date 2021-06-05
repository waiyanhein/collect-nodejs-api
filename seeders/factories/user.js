const authService = require('../../services/authService.js');

let now = new Date();

exports.users = [
  {
    name: "tester",
    email: "tester@gmail.com",
    password: authService.hashPassword("password1234"),
    createdAt: now,
    updatedAt: now,
    verifiedAt: now
  }
]
