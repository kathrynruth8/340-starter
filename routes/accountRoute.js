// Resources
const express = require('express');
const router = new express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const accValidate = require('../utilities/account-validation');

// Default logged-in route
router.get('/', accountController.buildAccountManagement);

// Route to build account view
router.get('/login', utilities.handleErrors(accountController.buildLogin));
// Registration view
router.get(
  '/register',
  utilities.handleErrors(accountController.buildRegister)
);
// registration post
router.post(
  '/register',
  accValidate.registationRules(),
  accValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  '/login',
  accValidate.loginRules(),
  accValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

module.exports = router;
