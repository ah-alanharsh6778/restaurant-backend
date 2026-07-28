const express = require('express');
const paymentController = require('./payment.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const { processPaymentValidation } = require('./payment.validation');

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'WAITER', 'STAFF'), processPaymentValidation, paymentController.processPayment);
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), paymentController.getAllPayments);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), paymentController.getPaymentById);
router.get('/order/:orderId', paymentController.getPaymentsByOrderId);

module.exports = router;
