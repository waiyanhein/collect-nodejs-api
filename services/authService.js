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

register = async ({ name, email, password }) => {
  try {
    let user = await User.create({
      name: name,
      email: email,
      password: hashPassword(password)
    })

    return {
      error: false,
      data: user
    }
  } catch (e) {
    return {
      error: true,
      message: e.message,
      code: 500
    }
  }
}

login = async ({ email, password }) => {
  try {
    let user = await User.findOne({
      where: {
        email: {
          [Op.eq]: email
        }
      }
    })

    if (user) {
      let isPasswordValid = await checkPassword(password, user.password);

      if (! isPasswordValid) {
        // password is not valid
        return {
          error: true,
          code: 400,
          message: "Account details are incorrect."
        }
      }

      // generate the token
      let info = { id: user.id, name: user.name, email: user.email };
      var token = jwt.sign(info, config.auth.jwtSecret, {
        expiresIn: config.auth.expiresIn
      })

      return {
        error: false,
        token: token,
        data: info
      };
    } else {
      // user matching the email not found
      return {
        error: true,
        code: 400,
        message: "User not found."
      }
    }
  } catch (e) {
    return {
      error: true,
      code: 500,
      message: e.message
    }
  }
}

logout = (data) => {

}

me = async (token) => {
  return new Promise(function(resolve, reject) {
    if (! token) {
      // token not passed
      resolve({
        error: true,
        code: 400,
        message: "Token is missing."
      });
      return;
    }

    jwt.verify(token, config.auth.jwtSecret, (err, decoded) => {
      if (err) {
        resolve({ error: true, code: 400, message: "Invalid token." })
        return
      }

      resolve({
        error: false,
        data: decoded
      })
    })
  });
}

exports.register = register;
exports.login = login;
exports.logout = logout;
exports.me = me;
