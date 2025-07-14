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
invCont.buildManagement = async (req, res) => {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();

  const classificationsData = await invModel.getClassifications();
  const classificationList = classificationsData.rows;

  res.render('inventory/management', {
    title: 'Inventory Management',
    nav,
    message: req.flash('message'),
    classificationList,
    classificationSelect,
  });
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

    const nav = await utilities.getNav(); // ✅ Rebuild nav
    const classificationsData = await invModel.getClassifications(); // ✅ Get updated classifications
    const classificationList = classificationsData.rows; // ✅ Define classificationList

    res.render('inventory/management', {
      title: 'Inventory Management',
      nav,
      classificationList,
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

invCont.buildAddInventory = async (req, res) => {
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  res.render('inventory/add-inventory', {
    title: 'Add Inventory',
    nav,
    classificationList,
    message: null,
    errors: null,
    inv_make: '',
    inv_model: '',
    inv_year: '',
    inv_description: '',
    inv_image: '/images/vehicles/no-image.png',
    inv_thumbnail: '/images/vehicles/no-image-tn.png',
    inv_price: '',
    inv_miles: '',
    inv_color: '',
  });
};

invCont.addInventory = async (req, res) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  const insertResult = await invModel.addInventory({
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  });

  if (insertResult) {
    req.flash('message', 'Vehicle successfully added.');
    const nav = await utilities.getNav();
    res.render('inventory/management', {
      title: 'Inventory Management',
      nav,
      message: req.flash('message'),
    });
  } else {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );
    res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList,
      message: 'Sorry, the inventory could not be added.',
      errors: null,
      ...req.body,
    });
  }
};

invCont.showDeleteClassification = async (req, res) => {
  const classification_id = req.params.classificationId;
  const nav = await utilities.getNav();
  const classification = await invModel.getClassificationById(
    classification_id
  );
  const inventory = await invModel.getInventoryByClassificationId(
    classification_id
  );

  // Fetch all classifications for the sidebar or navigation list if needed
  const classificationsData = await invModel.getClassifications();
  const classificationList = classificationsData.rows;

  if (!classification) {
    req.flash('message', 'Classification not found.');
    return res.redirect('/inv/');
  }

  res.render('inventory/delete-classification', {
    title: 'Delete Classification',
    nav,
    classification,
    inventory: inventory || [],
    classificationList, // <-- now properly defined
    message: req.flash('message'),
  });
};

// Process deletion
invCont.deleteClassification = async (req, res) => {
  const classification_id = req.params.classificationId;
  const inventory = await invModel.getInventoryByClassificationId(
    classification_id
  );

  if (inventory.length > 0) {
    req.flash(
      'message',
      'Cannot delete classification with associated inventory.'
    );
    return res.redirect(`/inv/delete-classification/${classification_id}`);
  }

  const deleted = await invModel.deleteClassificationById(classification_id);
  if (deleted) {
    req.flash('message', 'Classification deleted successfully.');
  } else {
    req.flash('message', 'Deletion failed.');
  }

  res.redirect('/inv/');
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error('No data returned'));
  }
};

module.exports = invCont;
