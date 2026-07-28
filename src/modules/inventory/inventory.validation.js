const { body, validationResult } = require('express-validator');

const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('name is required')
];

const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('name is required'),

  body('sku')
    .trim()
    .notEmpty()
    .withMessage('sku is required'),

  body('categoryId')
    .trim()
    .notEmpty()
    .withMessage('categoryId is required'),

  body('unit')
    .trim()
    .notEmpty()
    .withMessage('unit is required'),

  body('costPrice')
    .notEmpty()
    .withMessage('costPrice is required')
    .isFloat({ min: 0 })
    .withMessage('costPrice must be a valid number greater than or equal to 0'),

  body('sellingPrice')
    .notEmpty()
    .withMessage('sellingPrice is required')
    .isFloat({ min: 0 })
    .withMessage('sellingPrice must be a valid number greater than or equal to 0')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('name cannot be empty'),

  body('sku')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('sku cannot be empty'),

  body('categoryId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('categoryId cannot be empty'),

  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('costPrice must be a valid number greater than or equal to 0'),

  body('sellingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('sellingPrice must be a valid number greater than or equal to 0')
];

const createWarehouseValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('name is required'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('location is required')
];

const updateWarehouseValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('name cannot be empty'),

  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('location cannot be empty')
];

const stockTransactionValidation = [
  body('productId')
    .trim()
    .notEmpty()
    .withMessage('productId is required'),

  body('warehouseId')
    .trim()
    .notEmpty()
    .withMessage('warehouseId is required'),

  body('quantity')
    .notEmpty()
    .withMessage('quantity is required')
    .isFloat({ min: 0.001 })
    .withMessage('quantity must be greater than 0')
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
  createCategoryValidation,
  createProductValidation,
  updateProductValidation,
  createWarehouseValidation,
  updateWarehouseValidation,
  stockTransactionValidation,
  validate
};
