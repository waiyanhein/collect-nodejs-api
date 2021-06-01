let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let validators = require('../utilities/validators.js');
let config = require('../config.js');
const authService = require('../services/authService.js');
const mailService = require('../services/mailService.js');

const checkPassword = async (plainText, hash) => {
  let valid = await bcrypt.compare(plainText, hash);

  return valid;
}

const register = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  let result = await authService.register(req.body);
  if (result.error) {
    res.status(500).json(result);
  } else {
    // send the welcome email here to confirm the account
    await mailService.sendConfirmRegistration(result.data);

    res.status(200).json(result);
  }
}

const login = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  let result = await authService.login(req.body);
  if (result.error) {
    res.status(result.code).json(result);
  }

  res.status(200).json(result);
}

const me = (req, res) => {
  authService.me(req.auth.access_token)
  .then(result => {
    if (result.error) {
      res.status(result.code).json(result)
    } else {
      res.status(200).json(result);
    }
  })
}

const verifyResetPasswordToken = (req, res) => {

}

const resetPassword = (req, res) => {
  // verify the token here too
}

const sendResetPasswordEmail = (req, res) => {

}

const verifyAccount = (req, res) => {

}

exports.register = register;
exports.login = login;
exports.me = me;
