// Resources
const express = require('express');
const router = new express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const accValidate = require('../utilities/account-validation');

// Default logged-in route
router.get(
  '/',
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

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

// Update account
router.get(
  '/update/:account_id',
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccountView)
);

// Show account update form
router.get(
  '/update/:account_id',
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
);

// Handle account info update (first name, last name, email)
router.post(
  '/update-account',
  accValidate.accountUpdateRules(), // New middleware
  accValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// Handle password update
router.post(
  '/update-password',
  accValidate.passwordRules(),
  accValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
);

// Logout route
router.get('/logout', utilities.handleErrors(accountController.logout));

module.exports = router;
