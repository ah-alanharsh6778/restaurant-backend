const express = require('express');
const purchaseOrderController = require('./purchaseOrder.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const {
  uploadPoInvoice,
  createPurchaseOrderValidation,
  updatePurchaseOrderValidation,
  receiveItemsValidation,
  createPaymentValidation,
  validate
} = require('./purchaseOrder.validation');

const router = express.Router();

// Require JWT Authentication for all Purchase Order routes
router.use(authenticateToken);

/**
 * @openapi
 * /api/purchase-orders:
 *   post:
 *     tags:
 *       - Purchase Orders
 *     summary: Create a new Purchase Order
 *     description: Creates a new Purchase Order with items, financial totals (GST, Shipping, Discount), and sequential PO Number.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierId
 *               - items
 *             properties:
 *               supplierId:
 *                 type: string
 *               warehouseId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PENDING, APPROVED, ORDERED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED]
 *               paymentStatus:
 *                 type: string
 *                 enum: [PENDING, PARTIAL, PAID]
 *               gstAmount:
 *                 type: number
 *               discountAmount:
 *                 type: number
 *               shippingAmount:
 *                 type: number
 *               expectedDelivery:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ingredientId:
 *                       type: string
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Purchase Order created successfully
 */
router.post(
  '/',
  authorizeRoles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'),
  createPurchaseOrderValidation,
  validate,
  purchaseOrderController.createPurchaseOrder
);

/**
 * @openapi
 * /api/purchase-orders:
 *   get:
 *     tags:
 *       - Purchase Orders
 *     summary: Get paginated Purchase Orders list
 *     description: Returns paginated list of Purchase Orders with optional search, status, paymentStatus, supplierId, and warehouseId filters.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *       - in: query
 *         name: supplierId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of Purchase Orders
 */
router.get('/', purchaseOrderController.getAllPurchaseOrders);

/**
 * @openapi
 * /api/purchase-orders/{id}:
 *   get:
 *     tags:
 *       - Purchase Orders
 *     summary: Get Purchase Order details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase Order details
 */
router.get('/:id', purchaseOrderController.getPurchaseOrderById);

/**
 * @openapi
 * /api/purchase-orders/{id}:
 *   put:
 *     tags:
 *       - Purchase Orders
 *     summary: Update Purchase Order headers & items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase Order updated successfully
 */
router.put(
  '/:id',
  authorizeRoles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'),
  updatePurchaseOrderValidation,
  validate,
  purchaseOrderController.updatePurchaseOrder
);

/**
 * @openapi
 * /api/purchase-orders/{id}/approve:
 *   patch:
 *     tags:
 *       - Purchase Orders
 *     summary: Approve a Purchase Order
 *     description: Transitions Purchase Order status to APPROVED.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase Order approved
 */
router.patch(
  '/:id/approve',
  authorizeRoles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'),
  purchaseOrderController.approvePurchaseOrder
);

/**
 * @openapi
 * /api/purchase-orders/{id}/status:
 *   patch:
 *     tags:
 *       - Purchase Orders
 *     summary: Update Purchase Order status transition
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/:id/status',
  authorizeRoles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'),
  purchaseOrderController.updateStatus
);

/**
 * @openapi
 * /api/purchase-orders/{id}/payment-status:
 *   patch:
 *     tags:
 *       - Purchase Orders
 *     summary: Update Purchase Order payment status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status updated
 */
router.patch(
  '/:id/payment-status',
  authorizeRoles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'),
  purchaseOrderController.updatePaymentStatus
);

/**
 * @openapi
 * /api/purchase-orders/{id}/receive:
 *   post:
 *     tags:
 *       - Purchase Orders
 *     summary: Receive Purchase Order stock items into Warehouse inventory
 *     description: Atomically updates item receivedQuantity, creates StockTransactions (STOCK_IN), updates master Ingredient/Product stock, and updates PO status (RECEIVED or PARTIALLY_RECEIVED).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Items received and inventory updated
 */
router.post(
  '/:id/receive',
  authorizeRoles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'),
  receiveItemsValidation,
  validate,
  purchaseOrderController.receiveItems
);

/**
 * @openapi
 * /api/purchase-orders/{id}/upload-invoice:
 *   post:
 *     tags:
 *       - Purchase Orders
 *     summary: Upload Supplier Invoice & Automatically Create Expense
 *     description: Uploads supplier invoice PDF/image, runs AI OCR parser, creates SupplierInvoice, and automatically creates an Expense record in PostgreSQL.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Invoice uploaded and Expense automatically created
 */
router.post(
  '/:id/upload-invoice',
  authorizeRoles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'),
  uploadPoInvoice.single('file'),
  purchaseOrderController.uploadSupplierInvoice
);

/**
 * @openapi
 * /api/purchase-orders/{id}/payments:
 *   post:
 *     tags:
 *       - Purchase Orders
 *     summary: Record Payment for Purchase Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment recorded
 */
router.post(
  '/:id/payments',
  authorizeRoles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'),
  createPaymentValidation,
  validate,
  purchaseOrderController.createPayment
);

/**
 * @openapi
 * /api/purchase-orders/{id}/print:
 *   get:
 *     tags:
 *       - Purchase Orders
 *     summary: Get printable HTML Purchase Order document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Printable HTML document
 */
router.get('/:id/print', purchaseOrderController.printPurchaseOrder);

/**
 * @openapi
 * /api/purchase-orders/{id}/pdf:
 *   get:
 *     tags:
 *       - Purchase Orders
 *     summary: Generate Purchase Order PDF / HTML document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF Purchase Order document
 */
router.get('/:id/pdf', purchaseOrderController.generatePdf);

/**
 * @openapi
 * /api/purchase-orders/{id}:
 *   delete:
 *     tags:
 *       - Purchase Orders
 *     summary: Soft Delete Purchase Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase Order deleted
 */
router.delete(
  '/:id',
  authorizeRoles('ADMIN', 'MANAGER'),
  purchaseOrderController.deletePurchaseOrder
);

module.exports = router;
