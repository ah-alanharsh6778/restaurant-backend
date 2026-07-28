const express = require('express');
const wasteController = require('./waste.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const { logWasteValidation } = require('./waste.validation');

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), logWasteValidation, wasteController.logFoodWaste);
router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), wasteController.getAllWasteLogs);
router.get('/stats', authorizeRoles('ADMIN', 'MANAGER'), wasteController.getWasteStats);

module.exports = router;
