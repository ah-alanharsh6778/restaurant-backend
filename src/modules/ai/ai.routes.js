const express = require('express');
const aiController = require('./ai.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/predict-stock', authorizeRoles('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'), aiController.getStockPredictions);
router.get('/menu-pricing', authorizeRoles('ADMIN', 'MANAGER'), aiController.getMenuPricingRecommendations);
router.get('/food-waste', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), aiController.getFoodWasteAnalysis);
router.get('/prep-time', aiController.getPrepTimeEstimate);

module.exports = router;
