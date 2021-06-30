require('dotenv').config();
let express = require('express');
let bodyParser = require('body-parser');
let validators = require('./utilities/validators.js');
let app = express();
const apiRouter = express.Router();
const User = require('./models').User;

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
app.use(require('./middlewares/appMiddleware.js'));
// end app-level middlewares

// this function will allow us to declare the routes with middlewares esaily
// TODO: is there a better way?

// end custom functions to render routes in our own ways
const exampleRouteMiddleware = (req, res, next) => {
  // I am the route middleware
  next();
}

app.get('/', [
    exampleRouteMiddleware // if there are validation rules, merge the two array.
], function(req, res) {

  res.send('Welcome to Node JS app.');
});

app.use('/api', require('./routes/api.js'));

exports.app = app;
