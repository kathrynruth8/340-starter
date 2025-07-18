const { body, validationResult } = require('express-validator');
const utilities = require('../utilities');

const inventoryRules = () => {
  return [
    body('inv_make').trim().notEmpty().withMessage('Make is required.'),
    body('inv_model').trim().notEmpty().withMessage('Model is required.'),
    body('inv_year').isInt({ min: 1886 }).withMessage('Valid year required.'),
    body('inv_price').isFloat({ min: 0 }).withMessage('Valid price required.'),
    body('inv_miles').isInt({ min: 0 }).withMessage('Valid mileage required.'),
    body('inv_color').trim().notEmpty().withMessage('Color is required.'),
    body('inv_description')
      .trim()
      .notEmpty()
      .withMessage('Description required.'),
    body('inv_image').trim().notEmpty(),
    body('inv_thumbnail').trim().notEmpty(),
    body('classification_id').isInt().withMessage('Classification required.'),
  ];
};

const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  const classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  );
  const nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    return res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList,
      message: null,
      errors: errors.array(),
      ...req.body,
    });
  }
  next();
};

const checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const errors = validationResult(req);
  const classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  );
  const nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    return res.render('inventory/edit-inventory', {
      errors,
      title: 'Edit ' + inv_make + ' ' + inv_model,
      dropDown,
      nav,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    });
  }
  next();
};

module.exports = { inventoryRules, checkInventoryData, checkUpdateData };
