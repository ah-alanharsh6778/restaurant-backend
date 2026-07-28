const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation Failed', errors.array());
  }
  next();
};

const validateRegister = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('roleId').trim().notEmpty().withMessage('Role ID is required'),
  handleValidation
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation
];

const validateRefreshToken = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  handleValidation
];

module.exports = {
  validateRegister,
  validateLogin,
  validateRefreshToken
};
