// Needed Resources
const express = require('express');
const router = new express.Router();
const invController = require('../controllers/invController');
const utilities = require('../utilities');
const classValidate = require('../utilities/classification-validation');
const invValidate = require('../utilities/inventory-validation');

// Route to inventory management view
router.get(
  '/',
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagement)
);

// Route to build inventory by classification view
router.get(
  '/type/:classificationId',
  utilities.handleErrors(invController.buildByClassificationId)
);
// Build detail view
router.get(
  '/detail/:inv_id',
  utilities.handleErrors(invController.buildDetailView)
);

// TASK 2
// Show form
router.get(
  '/add-classification',
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
);

// Handle form submission
router.post(
  '/add-classification',
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  classValidate.classificationRules(),
  classValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// TASK 3
// Add Inventory
router.get(
  '/add-inventory',
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
);

router.post(
  '/add-inventory',
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Prepare W09
router.get(
  '/getInventory/:classification_id',
  utilities.handleErrors(invController.getInventoryJSON)
);

// Edit Inventory
router.get(
  '/edit/:inv_id',
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.editInventoryView)
);

router.post(
  '/update/',
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Delete Inventory
router.get(
  '/delete/:inv_id',
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteInventoryView)
);

// Handle the actual inventory deletion
router.post(
  '/delete',
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventory)
);

// Final Project Enhancement
router.get(
  '/delete-classification/:classificationId',
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.showDeleteClassification)
);

router.post(
  '/delete-classification/:classificationId',
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteClassification)
);

module.exports = router;
