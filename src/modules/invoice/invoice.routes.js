const express = require('express');
const invoiceController = require('./invoice.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const { uploadInvoice, validate } = require('./invoice.validation');

const router = express.Router();

router.use(authenticateToken);

// Upload & AI OCR Processing Routes (supports 'file' or 'invoices' fields)
router.post('/upload', authorizeRoles('ADMIN', 'MANAGER'), uploadInvoice.any(), invoiceController.uploadInvoice);
router.post('/:id/process', authorizeRoles('ADMIN', 'MANAGER'), invoiceController.processInvoice);
router.post('/:id/reprocess', authorizeRoles('ADMIN', 'MANAGER'), invoiceController.reprocessInvoice);

// Invoice CRUD Routes
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), invoiceController.getAllInvoices);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), invoiceController.getInvoiceById);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), invoiceController.deleteInvoice);

module.exports = router;
