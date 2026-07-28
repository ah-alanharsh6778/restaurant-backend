const express = require('express');
const stockController = require('./stock.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/adjust', authorizeRoles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'), stockController.adjustStock);
router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'), stockController.getAllStocks);
router.get('/warehouse/:warehouseId', authorizeRoles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'), stockController.getStocksByWarehouse);

module.exports = router;
