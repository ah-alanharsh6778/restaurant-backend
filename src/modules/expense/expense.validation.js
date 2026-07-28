const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

const uploadDir = path.join(__dirname, '../../../uploads/invoices');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent directory traversal & injection attacks
    const sanitizedOriginalName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(sanitizedOriginalName).toLowerCase();
    cb(null, 'invoice-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.png', '.jpeg', '.jpg'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

  // Strict MIME type and File Extension Validation
  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Security Violation: Only PDF, PNG, JPEG, and JPG files are permitted'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 20
  }
});

const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('name is required')
];

const createExpenseValidation = [
  body('amount')
    .notEmpty()
    .withMessage('amount is required')
    .isFloat({ min: 0 })
    .withMessage('amount must be a valid number greater than or equal to 0'),

  body('tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('tax must be a valid number greater than or equal to 0')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation Failed', errors.array());
  }
  next();
};

module.exports = {
  upload,
  createCategoryValidation,
  createExpenseValidation,
  validate
};
