const { body, validationResult } = require('express-validator');
const userService = require('../services/userService.js');

const isEmailAlreadyTaken = async (emailInput) => {
  let userResult = await userService.findUserByEmail(emailInput);

  if (userResult.data && ! userResult.error) {
    return true;
  } else {
    return false;
  }
}

// exact same logic as isEmailAlreadyTaken. Just want to clear the little philosophy in my head.
const accountEmailExists = async (emailInput) => {
  let userResult = await userService.findUserByEmail(emailInput);

  if (userResult.data && ! userResult.error) {
    return true;
  } else {
    return false;
  }
}

const auth = {
  register: [
    body('name').not().isEmpty().withMessage('Name is required.'),
    body('email').not().isEmpty().withMessage('Email is required.'),
    body('email').isEmail().withMessage('Email format is not valid.'),
    body('email').custom(value => {
      return isEmailAlreadyTaken(value).then(isTaken => {
        if (isTaken) {
          return Promise.reject("Email address is already taken.");
        }
      })
    }),
    body('password').not().isEmpty().withMessage('Password is required.'),
  ],
  login: [
    body('email').not().isEmpty().withMessage('Email is required.'),
    body('email').isEmail().withMessage('Email format is not valid.'),
    body('password').not().isEmpty().withMessage('Password is required.'),
  ],
  verifyVerificationToken: [
    body('email').not().isEmpty().withMessage("Email is required."),
    body('email').isEmail().withMessage('Email format is not valid.'),
    body("token").not().isEmpty().withMessage("Token is required"),
  ],
  resendConfirmRegistrationEmail: [
    body('email').not().isEmpty().withMessage("Email is required."),
    body('email').isEmail().withMessage('Email format is not valid.'),
    body("email").custom(value => {
      return accountEmailExists(value).then(emailExists => {
        if (! emailExists) {
          return Promise.reject("User account with the email does not exist.");
        }
      })
    })
  ],
  sendResetPasswordEmail: [
    body('email').not().isEmpty().withMessage("Email is required."),
    body('email').isEmail().withMessage('Email format is not valid.'),
    body("email").custom(value => {
      return accountEmailExists(value).then(emailExists => {
        if (! emailExists) {
          return Promise.reject("User account with the email does not exist.");
        }
      })
    })
  ]
}

exports.auth = auth;
exports.validate = (req) => {
  const errors = validationResult(req);

  if (! errors.isEmpty()) {
    console.log(errors);

    return {
      error: true,
      message: "Validation Error",
      errors: errors.array()
    }
  }

  return {
    error: false
  }
}
