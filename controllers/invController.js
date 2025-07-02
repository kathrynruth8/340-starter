const invModel = require('../models/inventory-model');
const utilities = require('../utilities/');

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render('./inventory/classification', {
    title: className + ' vehicles',
    nav,
    grid,
  });
};

/* ***************************
 *  Build inventory detail view
 * ************************** */
// controllers/invController.js

invCont.buildDetailView = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  const data = await invModel.getInventoryById(inv_id);
  const nav = await utilities.getNav();

  if (!data) {
    return res.status(404).render('errors/error', {
      title: 'Vehicle Not Found',
      message: "Sorry, that vehicle can't be found",
      nav,
    });
  }

  const vehicleHtml = utilities.buildDetailView(data);
  const title = `${data.inv_make} ${data.inv_model}`;

  res.render('./inventory/detail', {
    title: title,
    nav,
    vehicleHtml,
  });
};

// Show inventory management view
invCont.buildManagement = async (req, res, next) => {
  try {
    const nav = await utilities.getNav(); // ✅ GET NAVIGATION DATA

    res.render('inventory/management', {
      title: 'Inventory Management',
      message: req.flash('message'),
      nav, // ✅ PASS IT IN
    });
  } catch (err) {
    console.error('>>> Error in buildManagement:', err);
    next(err);
  }
};

invCont.buildAddClassification = async (req, res) => {
  const nav = await utilities.getNav();
  res.render('inventory/add-classification', {
    title: 'Add Classification',
    nav,
    message: null,
    errors: null,
  });
};

invCont.addClassification = async (req, res) => {
  const { classification_name } = req.body;

  const addResult = await invModel.addClassification(classification_name);

  if (addResult) {
    req.flash('message', `${classification_name} added successfully.`);
    const nav = await utilities.getNav(); // Rebuild nav with new item
    res.render('inventory/management', {
      title: 'Inventory Management',
      nav,
      message: req.flash('message'),
    });
  } else {
    const nav = await utilities.getNav();
    res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      message: 'Sorry, the classification could not be added.',
      errors: null,
    });
  }
};

invCont.buildAddInventory = (req, res) => {
  res.send('This will be the add inventory view'); // Task 3 placeholder
};

module.exports = invCont;
