// this middleware will initialize auth object extracting the token from the headers.
// NOTE: this middleware must be called before any other middlewares
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

const appMiddleware = (req, res, next) => {
  //TODO: fill in other details into the auth object.
  if (! req.auth) {
    req.auth = {
      is_logged_in: false,
      access_token: ""
    }
  }

  let accessToken = extractAccessToken(req);
  if (accessToken) {
    req.auth.access_token = accessToken;
    authService.validateAccessToken(accessToken)
    .then(result => {
      if (! result.error) {
        req.auth.id = result.data.id;
        req.auth.name = result.data.name;
        req.auth.email = result.data.email;
      }
      next();
    })
    .catch(error => {

      next();
    })
  } else {
    next();
  }
}

module.exports = appMiddleware;
