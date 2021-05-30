require('dotenv').config();
let express = require('express');
let bodyParser = require('body-parser');
let validators = require('./utilities/validators.js');
let routes = require('./utilities/routes.js');

let app = express();
// request body parser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
// end request body parser
// configure static files
app.use(express.static("public"));

// import the controllers
const AuthController = require('./controllers/AuthController.js');
// end importing controllers

// app-level middlewares
app.use((req, res, next) => {
  if (! req.auth) {
    req.auth = {
      is_logged_in: false
    }
  }

  next();
})
// end app-level middlewares

// this function will allow us to declare the routes with middlewares esaily
// TODO: is there a better way?
const routeWithMiddlewares = (appInstance, httpVerb, path, handler, middlewares = [ ],  validator = [ ]) => {
  if (middlewares.length > 0) {
    for (let i=0; i< middlewares.length; i++) {
      appInstance.use(path, middlewares[i]);
    }
  }

  switch (httpVerb.toLowerCase()) {
    case "get":
      app.get(path, validator, handler)
      break;
    case "post":
      app.post(path, validator, handler);
      break;
    case "delete":
      app.delete(path, validator, handler);
      break;
    case "put":
      app.put(path, validator, handler);
      break;
  }
}
// end custom functions to render routes in our own ways

app.get('/', function(req, res) {
  res.send('Welcome to Node JS app.');
});

exports.app = app;
