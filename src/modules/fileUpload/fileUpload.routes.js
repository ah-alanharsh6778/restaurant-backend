const express = require('express');
const fileUploadController = require('./fileUpload.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const { upload } = require('../expense/expense.validation');

const router = express.Router();

router.use(authenticateToken);

router.post('/upload-ocr', authorizeRoles('ADMIN', 'MANAGER'), upload.single('file'), fileUploadController.uploadFileAndProcessOCR);
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), fileUploadController.getAllUploadedFiles);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), fileUploadController.getFileById);

module.exports = router;
