const express = require('express');
const tableController = require('./table.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');

const router = express.Router();

// Public route for Customer QR Scan Table Identification
router.get('/public/:id', tableController.getTableById);

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN', 'MANAGER'), tableController.createTable);
router.get('/', tableController.getAllTables);
router.get('/availability', tableController.getTableAvailability);
router.get('/:id', tableController.getTableById);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER', 'STAFF', 'WAITER'), tableController.updateTable);
router.patch('/:id/status', authorizeRoles('ADMIN', 'MANAGER', 'STAFF', 'WAITER'), tableController.updateTableStatus);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), tableController.deleteTable);

module.exports = router;
