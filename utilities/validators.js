const { body, validationResult } = require('express-validator');
const userService = require('../services/userService.js');
const authService = require('../services/authService.js');

const isVerificationTokenValid = async ({
  token,
  email
}) => {
  let verificationResult = await authService.validateVerificationToken({
    email: email,
    token: token
  });

  return ! verificationResult.error;
}

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

const isOldPassword = async ({
  email,
  password
}) => {
  let userResult = await userService.findUserByEmail(email);

  let isValidPassword = await authService.checkPassword(password, userResult.data.password);

  return isValidPassword;
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
    body("token").not().isEmpty().withMessage("Token is required."),
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
  ],
  resetPassword: [
    body('email').not().isEmpty().withMessage("Email is required."),
    body('email').isEmail().withMessage('Email format is not valid.'),
    body("email").custom(value => {
      return accountEmailExists(value).then(emailExists => {
        if (! emailExists) {
          return Promise.reject("User account with the email does not exist.");
        }
      })
    }),
    body("token").not().isEmpty().withMessage("Token is required."),
    body("token").custom((value, { req }) => {
      return isVerificationTokenValid({
        email: req.body.email,
        token: value
      }).then(isValid => {
        if (! isValid) {
          return Promise.reject("Invalid token.");
        }
      })
    }),
    body('password').not().isEmpty().withMessage("New password is required."),
    body("password").custom((value, { req }) => {
      return isOldPassword({
        email: req.body.email,
        password: value
      }).then(isOldPassword => {
        if (isOldPassword) {
          return Promise.reject("You have provided the old password");
        }
      })
    }),
    body('confirm_password').not().isEmpty().withMessage("Please confirm the password."),
    body("confirm_password").custom((value, { req }) => {
      if (value != req.body.password) {
        throw new Error("Password fields do not match.");
      }

      return true;
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
