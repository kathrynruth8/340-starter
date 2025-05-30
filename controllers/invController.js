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

  // ✅ Fix the image path (avoid double /vehicles)
  if (data.inv_image && data.inv_image.startsWith('vehicles/')) {
    data.inv_image = `/images/${data.inv_image}`;
  }

  const vehicleHtml = utilities.buildDetailView(data);
  const title = `${data.inv_make} ${data.inv_model}`;

  res.render('./inventory/detail', {
    title: title,
    nav,
    vehicleHtml,
  });
};

module.exports = invCont;
