const express = require('express');
const router = express.Router();
const validators = require('../utilities/validators.js');
// importing the controllers
const authController = require('../controllers/authController.js');
// end importing the controllers

router.post('/auth/register', validators.auth.register, authController.register);
router.post('/auth/login', validators.auth.login, authController.login);
// me should be the protected route
router.get('/auth/me', authController.me);
router.post('/auth/verify-verification-token', authController.verifyVerificationToken);
router.post('/auth/resend-confirm-registration-email', authController.resendConfirmRegistrationEmail);

module.exports = router;
