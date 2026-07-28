const { body, validationResult } = require('express-validator');

const createSupplierValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('name is required'),

  body('contactPerson')
    .trim()
    .notEmpty()
    .withMessage('contactPerson is required'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('phone is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('Must be a valid email address'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('address is required'),

  body('gstNumber')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
];

const updateSupplierValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('name cannot be empty'),

  body('contactPerson')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('contactPerson cannot be empty'),

  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('phone cannot be empty'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),

  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('address cannot be empty'),

  body('gstNumber')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
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
  createSupplierValidation,
  updateSupplierValidation,
  validate
};
