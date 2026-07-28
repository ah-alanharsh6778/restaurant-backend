const express = require('express');
const orderController = require('./order.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const {
  createOrderValidation,
  updateOrderValidation,
  addOrderItemValidation,
  validate
} = require('./order.validation');

const router = express.Router();

// Public route for Customer Table QR Code Ordering
router.post(
  '/public',
  createOrderValidation,
  validate,
  orderController.createOrder
);

router.get('/public/:id', orderController.getOrderById);

router.use(authenticateToken);

router.post(
  '/',
  createOrderValidation,
  validate,
  orderController.createOrder
);

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.get('/:id/invoice-pdf', orderController.getInvoicePdf);

router.put(
  '/:id',
  updateOrderValidation,
  validate,
  orderController.updateOrder
);

router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), orderController.deleteOrder);

router.post(
  '/items',
  addOrderItemValidation,
  validate,
  orderController.addOrderItem
);

router.delete('/items/:id', orderController.removeOrderItem);

module.exports = router;
