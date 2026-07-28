const express = require('express');
const supplierInvoiceController = require('./supplierInvoice.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const { createSupplierInvoiceValidation } = require('./supplierInvoice.validation');

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createSupplierInvoiceValidation, supplierInvoiceController.createSupplierInvoice);
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), supplierInvoiceController.getAllSupplierInvoices);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), supplierInvoiceController.getSupplierInvoiceById);

module.exports = router;
