const { body, validationResult } = require('express-validator');

const createPurchaseOrderValidation = [
  body('supplierId')
    .trim()
    .notEmpty()
    .withMessage('supplierId is required'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('items must be an array containing at least one item'),

  body('items.*.ingredientId')
    .trim()
    .notEmpty()
    .withMessage('ingredientId is required for each item'),

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
  body('status')
    .optional()
    .trim()
    .isIn(['PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED'])
    .withMessage('status must be one of: PENDING, ORDERED, RECEIVED, CANCELLED'),

  body('expectedDelivery')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('expectedDelivery must be a valid ISO8601 date string')
];

const addPurchaseOrderItemValidation = [
  body('purchaseOrderId')
    .trim()
    .notEmpty()
    .withMessage('purchaseOrderId is required'),

  body('ingredientId')
    .trim()
    .notEmpty()
    .withMessage('ingredientId is required'),

  body('quantity')
    .notEmpty()
    .withMessage('quantity is required')
    .isFloat({ min: 0.001 })
    .withMessage('quantity must be a positive number'),

  body('price')
    .notEmpty()
    .withMessage('price is required')
    .isFloat({ min: 0 })
    .withMessage('price must be a valid non-negative number')
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
  createPurchaseOrderValidation,
  updatePurchaseOrderValidation,
  addPurchaseOrderItemValidation,
  validate
};
