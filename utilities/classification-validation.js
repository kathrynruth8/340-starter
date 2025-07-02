const { body, validationResult } = require('express-validator');
const invModel = require('../models/inventory-model');
const utilities = require('../utilities');
const validate = {};

validate.classificationRules = () => {
  return [
    body('classification_name')
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage('Classification name is required.'),
  ];
};

validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  const nav = await utilities.getNav();
  if (!errors.isEmpty()) {
    const nav = res.locals.nav || '';
    return res.render('inventory/add-classification', {
      errors,
      title: 'Add Classification',
      nav,
      message: null,
    });
  }
  // Check if classification already exists
  const exists = await invModel.checkExistingClassification(
    classification_name
  );
  if (exists) {
    return res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      message: null,
      errors: [
        {
          msg: 'That classification already exists. Please choose a different name.',
        },
      ],
    });
  }
  next();
};

module.exports = validate;
