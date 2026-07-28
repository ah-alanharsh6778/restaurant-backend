const express = require('express');
const purchaseOrderController = require('./purchaseOrder.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const {
  createPurchaseOrderValidation,
  updatePurchaseOrderValidation,
  validate
} = require('./purchaseOrder.validation');

const router = express.Router();

router.use(authenticateToken);

router.post(
  '/',
  authorizeRoles('ADMIN', 'MANAGER'),
  createPurchaseOrderValidation,
  validate,
  purchaseOrderController.createPurchaseOrder
);

router.get('/', purchaseOrderController.getAllPurchaseOrders);
router.get('/:id', purchaseOrderController.getPurchaseOrderById);

router.put(
  '/:id',
  authorizeRoles('ADMIN', 'MANAGER'),
  updatePurchaseOrderValidation,
  validate,
  purchaseOrderController.updatePurchaseOrderStatus
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN', 'MANAGER'),
  purchaseOrderController.deletePurchaseOrder
);

module.exports = router;
