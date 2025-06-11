// Resources
const express = require('express');
const router = new express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');

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
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

module.exports = router;
