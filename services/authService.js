let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let config = require('../config.js');
let models = require('../models');
const { Op } = require("sequelize");
const crypto = require("crypto");
const date = require('date-and-time');
let validators = require('../utilities/validators.js');
let userService = require('./userService.js');
let VerificationToken = models.VerificationToken;

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
}

const hashPassword = (plainPassword) => {
  return bcrypt.hashSync(plainPassword, 8);
}

const checkPassword = async (plainText, hash) => {
  let valid = await bcrypt.compare(plainText, hash);

  return valid;
}

register = async ({ name, email, password }) => {
  try {
    let userResult = await userService.create({ name: name, email: email, password:hashPassword(password)  })

    if (userResult.user) {
      return {
        error: false,
        data: userResult.data
      }
    } else {
      return userResult;
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
    let userResult = await userService.findUserByEmail(email);
    let user = userResult.data;

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

generateAccountVerificationLink = async (user) => {
  try {
    let verificationToken = generateVerificationToken();
    let now = new Date();
    let expiresAt = date.addSeconds(now, config.auth.accountVerificationLinkLifespan);

    await VerificationToken.create({
      userId: user.id,
      expiresAt: expiresAt,
      verificationToken: verificationToken
    })

    let verificationLink = `${config.baseUrl}/auth/verify-account?email=${user.email}&token=${verificationToken}`;

    return {
      error: false,
      data: {
        link: verificationLink
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

//TODO: check if the expiresAt is working
const  verifyVerificationToken = async ({ email, token }) => {
  try {
    let userResult = await userService.findUserByEmail(email);
    let user = userResult.data;

    if (! user) {
      return {
        error: true,
        code: 400,
        message: "Invalid account."
      }
    }

    let tokenModel = await VerificationToken.findOne({
      where: {
        userId: {
          [Op.eq]: user.id
        },
        verificationToken: {
          [Op.eq]: token
        }
      }
    })

    if (! tokenModel) {
      return {
        error: true,
        code: 400,
        message: "Invalid token."
      }
    }

    // check if the token is expired
    let now = new Date();
    if (now.getTime() < tokenModel.expiresAt.getTime()) {
      // check if the token is already verified
      if (tokenModel.verifiedAt) {
        // already verified
        return {
          error: true,
          message: "Token has already been used",
          code: 400
        }
      }

      // update the verifiedAt column
      await VerificationToken.update({
        verifiedAt: now
      }, {
        where: {
          id: {
            [Op.eq]: tokenModel.id
          }
        }
      })

      return {
        error: false
      }
    } else {
        // token is expired
        return {
          error: true,
          code: 400,
          message: "Token been expired."
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

exports.register = register;
exports.login = login;
exports.me = me;
exports.generateAccountVerificationLink = generateAccountVerificationLink;
exports. verifyVerificationToken =  verifyVerificationToken;
