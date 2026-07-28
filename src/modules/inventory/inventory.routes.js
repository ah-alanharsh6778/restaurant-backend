const express = require('express');
const inventoryController = require('./inventory.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const {
  createCategoryValidation,
  createProductValidation,
  updateProductValidation,
  createWarehouseValidation,
  updateWarehouseValidation,
  stockTransactionValidation,
  validate
} = require('./inventory.validation');

const router = express.Router();

router.use(authenticateToken);

// Category Routes
router.post('/categories', authorizeRoles('ADMIN', 'MANAGER'), createCategoryValidation, validate, inventoryController.createCategory);
router.get('/categories', inventoryController.getAllCategories);

// Product Routes
router.post('/products', authorizeRoles('ADMIN', 'MANAGER'), createProductValidation, validate, inventoryController.createProduct);
router.get('/products', inventoryController.getAllProducts);
router.get('/products/:id', inventoryController.getProductById);
router.put('/products/:id', authorizeRoles('ADMIN', 'MANAGER'), updateProductValidation, validate, inventoryController.updateProduct);
router.delete('/products/:id', authorizeRoles('ADMIN', 'MANAGER'), inventoryController.deleteProduct);

// Warehouse Routes
router.post('/warehouses', authorizeRoles('ADMIN', 'MANAGER'), createWarehouseValidation, validate, inventoryController.createWarehouse);
router.get('/warehouses', inventoryController.getAllWarehouses);
router.put('/warehouses/:id', authorizeRoles('ADMIN', 'MANAGER'), updateWarehouseValidation, validate, inventoryController.updateWarehouse);
router.delete('/warehouses/:id', authorizeRoles('ADMIN', 'MANAGER'), inventoryController.deleteWarehouse);

// Inventory Stock & History Routes
router.post('/stock-in', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), stockTransactionValidation, validate, inventoryController.stockIn);
router.post('/stock-out', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), stockTransactionValidation, validate, inventoryController.stockOut);
router.get('/stock-history', inventoryController.getStockHistory);

module.exports = router;
