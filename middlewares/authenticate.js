const authService = require('../services/authService.js');

const extractAccessToken = (req) => {
  if (! req.headers.authorization) {
    return null;
  }

  //check if it begins with Bearer
  if (! req.headers.authorization.startsWith("Bearer")) {
    return null;
  }

  let segments = req.headers.authorization.split(" ");

  if (segments.length != 2) {
    return null;
  }

  return segments[1];
}

const authenticate = () => {
  let accessToken = extractAccessToken(req);

  if (! accessToken) {
    res.status(400);
    res.json({
      error: true,
      message: "Unauthorized Access!"
    })
  } else {
    authService.validateAccessToken(accessToken)
    .then(result => {
      if (result.error) {
        res.status(result.code);
        res.json({
          error: true,
          message: result.message
        })
      } else {
        next();
      }
    })
    .catch(error => {
      res.status(error.code);
      res.json({
        error: true,
        message: error.message
      })
    })
  }
}

exports.authenticate = authenticate;
