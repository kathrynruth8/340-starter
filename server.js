/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const env = require('dotenv').config();
const app = express();
const utilities = require('./utilities');
const static = require('./routes/static');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Routes/controllers
const baseController = require('./controllers/baseController');
const inventoryRoute = require('./routes/inventoryRoute');
const accountRoute = require('./routes/accountRoute');

// Sessions/messages activity
const session = require('express-session');
const pool = require('./database/');

/* ***********************
 * Middleware
 * ************************/
app.use(
  session({
    store: new (require('connect-pg-simple')(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: 'sessionId',
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(utilities.checkJWTToken);
app.use(utilities.checkLoginStatus);

/* ***********************
 * View Engine Templates
 *************************/
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layouts/layout');
app.use(express.static('public'));

/* ***********************
 * Routes
 *************************/
app.use(static);
// Index route
app.get('/', utilities.handleErrors(baseController.buildHome));
// Inventory routes
app.use('/inv', inventoryRoute);
// Account routes
app.use('/account', accountRoute);
// cookie for logout
app.use((req, res, next) => {
  if (req.cookies.logoutMessage) {
    req.flash('notice', req.cookies.logoutMessage);
    res.clearCookie('logoutMessage'); // Clear it so it doesn't persist
  }
  next();
});
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Oops! We lost that page' });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if (err.status == 404) {
    message = err.message;
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?';
  }
  res.render('errors/error', {
    title: err.status || 'Server Error',
    message,
    nav,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
