const invModel = require('../models/inventory-model');
const Util = {};
const jwt = require('jsonwebtoken');
require('dotenv').config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let nav = '<nav class="nav-bar">';

  nav += '<a href=" /">Home</a>';

  data.rows.forEach((row) => {
    nav += `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>`;
  });
  nav += '</nav>';
  return nav;
};
/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += '<li>';
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        ' ' +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        ' ' +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        ' ' +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        ' ' +
        vehicle.inv_model +
        '</a>';
      grid += '</h2>';
      grid +=
        '<span>$' +
        new Intl.NumberFormat('en-US').format(vehicle.inv_price) +
        '</span>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the classification list
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += ' selected ';
    }
    classificationList += '>' + row.classification_name + '</option>';
  });
  classificationList += '</select>';
  return classificationList;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* **************************************
 * Build the single inventory view HTML
 * ************************************ */
Util.buildDetailView = function (vehicle) {
  if (!vehicle) return '<p>Vehicle not found.</p>';
  const price = Number(vehicle.inv_price).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const miles = Number(vehicle.inv_miles).toLocaleString('en-US');
  const image = vehicle.inv_image;

  return `
  <div class="vehicle-detail">
    <div class="vehicle-image">
    <img src="${image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">

    </div>
    <div class="vehicle-info">
      <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
      <p><strong>Price:</strong> ${price}</p>
      <p><strong>Miles:</strong> ${miles} miles</p>
      <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      <p><strong>Color:</strong> ${vehicle.inv_color}</p>
    </div>
  </div>
`;
};

function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
      if (err) {
        res.clearCookie('jwt');
        res.locals.loggedin = 0;
        res.locals.accountData = null;
        return next(); // ⬅️ keep flowing normally
      }
      res.locals.loggedin = 1;
      res.locals.accountData = accountData;
      return next();
    });
  } else {
    res.locals.loggedin = 0;
    res.locals.accountData = null;
    return next(); // ⬅️ same here
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash('notice', 'Please log in.');
    return res.redirect('/account/login');
  }
};

/**
 * Middleware to inject login data from session into all views
 */
Util.checkLoginStatus = (req, res, next) => {
  if (req.session.accountData) {
    res.locals.accountData = req.session.accountData;
    res.locals.loggedin = true;
  } else {
    res.locals.loggedin = false;
  }
  next();
};

// middleware to check if user is Admin or Employee
Util.checkEmployeeOrAdmin = (req, res, next) => {
  const account = res.locals.accountData;

  if (
    res.locals.loggedin &&
    (account.account_type === 'Employee' || account.account_type === 'Admin')
  ) {
    return next(); // allow access
  }

  req.flash('notice', 'You must be an employee or admin to access that page.');
  return res.redirect('/account/login');
};

module.exports = { handleErrors };

module.exports = Util;
