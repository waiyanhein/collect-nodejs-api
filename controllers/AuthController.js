let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let validators = require('../utilities/validators.js');
let config = require('../config.js');
let models = require('../models');
const { Op } = require("sequelize");
let User = models.User;

const hashPassword = (plainPassword) => {
  return bcrypt.hashSync(plainPassword, 8);
}

const checkPassword = async (plainText, hash) => {
  let valid = await bcrypt.compare(plainText, hash);

  return valid;
}

const register = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  try {
    let user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashPassword(req.body.password)
    })

    res.status(200)
    .json({
      error: false,
      data: user
    })
  } catch (e) {
    res.status(500)
    .json({
      error: true,
      message: e.message
    })
  }
}

//TODO: check the password
const login = async (req, res) => {
  const validationResult = validators.validate(req);
  if (validationResult.error) {
    return res.status(400).json(validationResult);
  }

  try {
    let user = await User.findOne({
      where: {
        email: {
          [Op.eq]: req.body.email
        }
      }
    })

    if (user) {
      let isPasswordValid = await checkPassword(req.body.password, user.password);

      if (! isPasswordValid) {
        return res.status(400).json({
          error: true,
          message: "Password is not valid."
        })
      }
      // generate the token
      let info = { id: user.id, name: user.name, email: user.email };
      var token = jwt.sign(info, config.auth.jwtSecret, {
        expiresIn: config.auth.expiresIn
      })

      res
      .status(200)
      .json({
        error: false,
        token: token,
        data: info
      })
    } else {
      res.status(400).json({
        error: true,
        message: "User not found."
      })
    }
  } catch (e) {
    res.status(500)
    .json({
      error: true,
      message: e.message
    })
  }
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
