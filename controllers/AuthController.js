let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let validators = require('../utilities/validators.js');
let config = require('../config.js');
let models = require('../models');
const { Op } = require("sequelize");
let User = models.User;
const authService = require('../services/authService.js');

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
    //TODO: send the welcome email here to confirm the account

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
  let token = req.auth.access_token;

  if (! token) {
    // token not passed
    return res.status(400).json({
      error: true,
      message: "Token is missing."
    })
  }

  jwt.verify(token, config.auth.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(400).json({ error: true, message: "Invalid token." });
    }

    res.status(200).send({
      error: false,
      data: decoded
    });
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
