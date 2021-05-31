const { body, validationResult } = require('express-validator');

const auth = {
  register: [
    body('name').not().isEmpty().withMessage('Name is required.'),
    body('email').not().isEmpty().withMessage('Email is required.'),
    body('email').isEmail().withMessage('Email format is not valid.'),
    body('password').not().isEmpty().withMessage('Password is required.'),
  ],
  login: [
    body('email').not().isEmpty().withMessage('Email is required.'),
    body('email').isEmail().withMessage('Email format is not valid.'),
    body('password').not().isEmpty().withMessage('Password is required.'),
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
