const utilities = require('.');
const accountModel = require('../models/account-model');
const { body, validationResult } = require('express-validator');
const validate = {};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body('account_firstname')
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage('Please provide a first name.'), // on error this message is sent.

    // lastname is required and must be string
    body('account_lastname')
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage('Please provide a last name.'), // on error this message is sent.

    // valid email is required and cannot already exist in the DB
    body('account_email')
      .trim()
      .notEmpty()
      .withMessage('Email is required.')
      .bail()
      .isEmail()
      .withMessage('A valid email is required.')
      .bail()
      .custom(async (email, { req }) => {
        // Normalize manually (like .normalizeEmail()) to make sure comparison is reliable
        const normalizedEmail = email.toLowerCase().trim();

        const existingAccount = await accountModel.getAccountByEmail(
          normalizedEmail
        );
        if (
          existingAccount &&
          existingAccount.account_id != req.body.account_id
        ) {
          throw new Error('Email already in use');
        }
        return true;
      })
      .normalizeEmail(), // apply after validation

    // password is required and must be strong password
    body('account_password')
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage('Password does not meet requirements.'),
  ];
};

validate.loginRules = () => {
  return [
    // valid email is required
    body('account_email')
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage('A valid email is required.')
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists == 0) {
          throw new Error(
            'Email does not exist. Please register or use different email'
          );
        }
      }),

    // password is required and must be strong password
    body('account_password')
      .trim()
      .notEmpty()
      .withMessage('Password is required.'),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render('account/register', {
      errors,
      title: 'Registration',
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render('account/login', {
      errors,
      title: 'Login',
      nav,
      account_email,
    });
    return;
  }
  next();
};

validate.accountUpdateRules = () => {
  return [
    body('account_firstname')
      .trim()
      .notEmpty()
      .withMessage('First name required.'),
    body('account_lastname')
      .trim()
      .notEmpty()
      .withMessage('Last name required.'),
    body('account_email')
      .trim()
      .isEmail()
      .withMessage('Valid email required.')
      .custom(async (email, { req }) => {
        const account = await accountModel.getAccountByEmail(email);
        if (account && account.account_id != req.body.account_id) {
          throw new Error('Email already in use.');
        }
      }),
  ];
};

validate.checkAccountUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await require('./index').getNav();
    return res.render('account/update', {
      title: 'Update Account Info',
      nav,
      errors,
      ...req.body,
    });
  }
  next();
};

validate.passwordRules = () => {
  return [
    body('account_password')
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        'Password must be at least 12 characters and include uppercase, lowercase, number, and symbol.'
      ),
  ];
};

validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await require('./index').getNav();
    return res.render('account/update', {
      title: 'Update Account Info',
      nav,
      errors,
      account_id: req.body.account_id,
    });
  }
  next();
};
module.exports = validate;
