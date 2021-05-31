const express = require('express');
const router = express.Router();
const validators = require('../utilities/validators.js');
// importing the controllers
const authController = require('../controllers/authController.js');
// end importing the controllers

router.get('/auth', (req, res) => {
   res.send('Implement the auth.');
})
router.post('/auth/register', validators.auth.register, authController.register);
router.post('/auth/login', validators.auth.login, authController.login);
// me should be the protected route
router.get('/auth/me', authController.me);

module.exports = router;