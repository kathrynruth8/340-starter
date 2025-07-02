// Needed Resources
const express = require('express');
const router = new express.Router();
const invController = require('../controllers/invController');
const utilities = require('../utilities');
const regValidate = require('../utilities/classification-validation');

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

// Routes for links (Tasks 2 & 3)
router.get('/add-classification', invController.buildAddClassification); // Task 2
router.get('/add-inventory', invController.buildAddInventory); // Task 3

// TASK 2
// Show form
router.get(
  '/add-classification',
  utilities.handleErrors(invController.buildAddClassification)
);

// Handle form submission
router.post(
  '/add-classification',
  regValidate.classificationRules(),
  regValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

module.exports = router;
