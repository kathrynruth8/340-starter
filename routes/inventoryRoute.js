// Needed Resources
const express = require('express');
const router = new express.Router();
const invController = require('../controllers/invController');
const utilities = require('../utilities');

// Route to inventory management view
router.get('/', utilities.handleErrors(invController.buildManagement));

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

module.exports = router;
