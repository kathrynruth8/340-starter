const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render('account/login', {
    title: 'Login',
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render('account/register', {
    title: 'Register',
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver management view
 * *************************************** */
const buildAccountManagement = async (req, res) => {
  try {
    let nav = await utilities.getNav();
    res.render('account/management', {
      title: 'Account Management',
      nav,
      errors: null,
    });
  } catch (err) {
    console.error('Error loading account management view:', err);
    res.status(500).send('Server error');
  }
};

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      'notice',
      'Sorry, there was an error processing the registration.'
    );
    res.status(500).render('account/register', {
      title: 'Registration',
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      'notice',
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render('account/login', {
      title: 'Login',
      nav,
      errors: null,
    });
  } else {
    req.flash('notice', 'Sorry, the registration failed.');
    res.status(501).render('account/register', {
      title: 'Registration',
      nav,
    });
  }
}
/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash('notice', 'Please check your credentials and try again.');
    res.status(400).render('account/login', {
      title: 'Login',
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;

      // Save to session
      req.session.accountData = {
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_type: accountData.account_type,
      };
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === 'development') {
        res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie('jwt', accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      req.flash('notice', 'You are logged in.');
      return res.redirect('/account/');
    } else {
      req.flash('notice', 'Please check your credentials and try again.');
      res.status(400).render('account/login', {
        title: 'Login',
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error('Access Forbidden');
  }
}

async function buildUpdateAccountView(req, res) {
  let nav = await utilities.getNav();
  const account_id = parseInt(req.params.account_id);
  const accountData = await accountModel.getAccountById(account_id);

  res.render('account/update', {
    title: 'Update Account',
    nav,
    errors: null,
    accountData,
  });
}
/* ****************************************
 *  show update form
 * ************************************ */
const buildUpdateAccount = async (req, res) => {
  const account_id = parseInt(req.params.account_id);
  const account = await accountModel.getAccountById(account_id);
  const nav = await utilities.getNav();

  res.render('account/update', {
    title: 'Update Account Info',
    nav,
    errors: null,
    ...account,
  });
};

/* ****************************************
 *  handle account update
 * ************************************ */
const updateAccount = async (req, res) => {
  const { account_id, account_firstname, account_lastname, account_email } =
    req.body;
  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );
  const nav = await utilities.getNav();

  if (updateResult) {
    req.flash('notice', 'Account information updated.');
    const account = await accountModel.getAccountById(account_id);
    return res.render('account/management', {
      title: 'Account Management',
      nav,
      accountData: account,
      errors: null,
    });
  } else {
    req.flash('notice', 'Account update failed.');
    return res.redirect(`/account/update/${account_id}`);
  }
};

/* ****************************************
 *  handle password change
 * ************************************ */
const updatePassword = async (req, res) => {
  const { account_id, account_password } = req.body;
  const hashedPassword = await bcrypt.hash(account_password, 10);
  const nav = await utilities.getNav();

  const updateResult = await accountModel.updatePassword(
    account_id,
    hashedPassword
  );
  const account = await accountModel.getAccountById(account_id);

  if (updateResult) {
    req.flash('notice', 'Password updated.');
    res.render('account/management', {
      title: 'Account Management',
      nav,
      accountData: account,
      errors: null,
    });
  } else {
    req.flash('notice', 'Password update failed.');
    res.redirect(`/account/update/${account_id}`);
  }
};

/* ****************************************
 *  Process logout request
 * *************************************** */
function logout(req, res) {
  req.flash('notice', 'You have been logged out.');
  res.clearCookie('jwt');

  req.session.destroy(() => {
    res.redirect('/');
  });
}

module.exports = {
  buildLogin,
  buildRegister,
  buildAccountManagement,
  registerAccount,
  accountLogin,
  buildUpdateAccountView,
  buildUpdateAccount,
  updateAccount,
  updatePassword,
  logout,
};
