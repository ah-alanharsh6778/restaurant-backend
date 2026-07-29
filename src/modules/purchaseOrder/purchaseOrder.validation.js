const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

// Setup upload directory for Supplier Invoices
const uploadDir = path.join(__dirname, '../../../uploads/invoices');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitizedOriginalName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(sanitizedOriginalName).toLowerCase();
    cb(null, 'po-inv-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.png', '.jpeg', '.jpg'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Invalid file format. Only PDF, PNG, JPG, and JPEG images are allowed.'), false);
  }
};

const uploadPoInvoice = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB file size limit
  }
});

const createPurchaseOrderValidation = [
  body('supplierId')
    .trim()
    .notEmpty()
    .withMessage('supplierId is required'),

  body('warehouseId')
    .optional({ nullable: true })
    .trim()
    .isString(),

  body('status')
    .optional()
    .trim()
    .isIn(['DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'])
    .withMessage('status must be a valid PurchaseOrderStatus value'),

  body('paymentStatus')
    .optional()
    .trim()
    .isIn(['PENDING', 'PARTIAL', 'PAID'])
    .withMessage('paymentStatus must be one of: PENDING, PARTIAL, PAID'),

  body('gstAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('gstAmount must be a non-negative number'),

  body('discountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('discountAmount must be a non-negative number'),

  body('shippingAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('shippingAmount must be a non-negative number'),

  body('expectedDelivery')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('expectedDelivery must be a valid ISO8601 date string'),

  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .isString(),

  body('items')
    .isArray({ min: 1 })
    .withMessage('items must be an array containing at least one item'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('quantity is required for each item')
    .isFloat({ min: 0.001 })
    .withMessage('quantity must be a positive number'),

  body('items.*.price')
    .notEmpty()
    .withMessage('price is required for each item')
    .isFloat({ min: 0 })
    .withMessage('price must be a valid non-negative number')
];

const updatePurchaseOrderValidation = [
  body('supplierId')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isString(),

  body('warehouseId')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isString(),

  body('status')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isIn(['DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'])
    .withMessage('status must be one of: DRAFT, PENDING, APPROVED, ORDERED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED'),

  body('paymentStatus')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isIn(['PENDING', 'PARTIAL', 'PAID'])
    .withMessage('paymentStatus must be one of: PENDING, PARTIAL, PAID'),

  body('gstAmount')
    .optional({ nullable: true })
    .isFloat({ min: 0 }),

  body('discountAmount')
    .optional({ nullable: true })
    .isFloat({ min: 0 }),

  body('shippingAmount')
    .optional({ nullable: true })
    .isFloat({ min: 0 }),

  body('expectedDelivery')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('expectedDelivery must be a valid ISO8601 date string')
];

const receiveItemsValidation = [
  body('warehouseId')
    .optional({ nullable: true })
    .trim()
    .isString(),

  body('receivedItems')
    .isArray({ min: 1 })
    .withMessage('receivedItems must be an array containing received quantities for PO items'),

  body('receivedItems.*.itemId')
    .trim()
    .notEmpty()
    .withMessage('itemId (PurchaseOrderItem ID) is required'),

  body('receivedItems.*.receivedQty')
    .notEmpty()
    .isFloat({ min: 0.001 })
    .withMessage('receivedQty must be a positive number')
];

const createPaymentValidation = [
  body('amountPaid')
    .notEmpty()
    .withMessage('amountPaid is required')
    .isFloat({ min: 0.01 })
    .withMessage('amountPaid must be greater than 0'),

  body('paymentMethod')
    .optional()
    .trim()
    .isIn(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'DUE'])
    .withMessage('paymentMethod must be a valid PaymentMethod enum'),

  body('notes')
    .optional({ nullable: true })
    .isString()
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  uploadPoInvoice,
  createPurchaseOrderValidation,
  updatePurchaseOrderValidation,
  receiveItemsValidation,
  createPaymentValidation,
  validate
};
