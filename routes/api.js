const express = require('express');
const router = express.Router();
const validators = require('../utilities/validators.js');
// importing the controllers
const authController = require('../controllers/authController.js');
const regionController = require('../controllers/regionController.js');
const exchangeRequestController = require('../controllers/exchangeRequestController.js');
// end importing the controllers

router.post('/auth/register', validators.auth.register, authController.register);
router.post('/auth/login', validators.auth.login, authController.login);
// me should be the protected route
router.get('/auth/me', authController.me);
router.post('/auth/validate-verification-token', validators.auth.verifyVerificationToken, authController.validateVerificationToken);
router.post('/auth/verify-verification-token', validators.auth.verifyVerificationToken, authController.verifyVerificationToken);
router.post('/auth/verify-account-email', validators.auth.verifyVerificationToken, authController.verifyUserAccount);
router.post('/auth/resend-confirm-registration-email', validators.auth.resendConfirmRegistrationEmail, authController.resendConfirmRegistrationEmail);
router.post('/auth/send-resetpassword-link', validators.auth.sendResetPasswordEmail, authController.sendResetPasswordEmail);
router.put('/auth/reset-password', validators.auth.resetPassword, authController.resetPassword);

router.get('/regions', regionController.get);

router.post('/exchange-request', validators.exchangeRequest.create, exchangeRequestController.create);

module.exports = router;
