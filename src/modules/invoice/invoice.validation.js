const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
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
    const sanitizedOriginalName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(sanitizedOriginalName).toLowerCase();
    cb(null, 'inv-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.png', '.jpeg', '.jpg'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Invalid file type. Only PDF, PNG, JPG, and JPEG images are allowed.'), false);
  }
};

const uploadInvoice = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  }
});

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation Failed', errors.array());
  }
  next();
};

module.exports = {
  uploadInvoice,
  validate
};
