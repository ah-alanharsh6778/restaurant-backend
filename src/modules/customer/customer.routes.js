const express = require('express');
const customerController = require('./customer.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const { createCustomerValidation, updateCustomerValidation } = require('./customer.validation');

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'WAITER', 'STAFF'), createCustomerValidation, customerController.createCustomer);
router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'WAITER', 'STAFF'), customerController.getAllCustomers);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER', 'WAITER', 'STAFF'), customerController.getCustomerById);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER', 'WAITER', 'STAFF'), updateCustomerValidation, customerController.updateCustomer);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), customerController.deleteCustomer);

module.exports = router;
