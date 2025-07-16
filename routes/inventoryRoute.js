// Needed Resources
const express = require('express');
const router = new express.Router();
const invController = require('../controllers/invController');
const utilities = require('../utilities');
const classValidate = require('../utilities/classification-validation');
const invValidate = require('../utilities/inventory-validation');

// // Route to inventory management view
router.get('/', (req, res, next) => {
  invController.buildManagement(req, res, next);
});

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
  utilities.handleErrors(invController.buildAddClassification)
);

// Handle form submission
router.post(
  '/add-classification',
  classValidate.classificationRules(),
  classValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// TASK 3
router.get(
  '/add-inventory',
  utilities.handleErrors(invController.buildAddInventory)
);

router.post(
  '/add-inventory',
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Prepare W09
router.get(
  '/getInventory/:classification_id',
  utilities.handleErrors(invController.getInventoryJSON)
);

router.get(
  '/edit/:inv_id',
  utilities.handleErrors(invController.editInventoryView)
);

router.post(
  '/update/',
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Show the delete confirmation view
router.get(
  '/delete/:inv_id',
  utilities.handleErrors(invController.buildDeleteInventoryView)
);

// Handle the actual inventory deletion
router.post('/delete', utilities.handleErrors(invController.deleteInventory));

// Final Project Enhancement
router.get(
  '/delete-classification/:classificationId',
  utilities.handleErrors(invController.showDeleteClassification)
);

router.post(
  '/delete-classification/:classificationId',
  utilities.handleErrors(invController.deleteClassification)
);

module.exports = router;
