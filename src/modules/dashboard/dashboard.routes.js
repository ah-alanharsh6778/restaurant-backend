const express = require('express');
const dashboardController = require('./dashboard.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

router.get('/summary', dashboardController.getDashboardSummary);
router.get('/sales-overview', dashboardController.getSalesOverview);
router.get('/orders', dashboardController.getOrdersBreakdown);
router.get('/revenue', dashboardController.getRevenueMetrics);
router.get('/profit', dashboardController.getProfitMetrics);
router.get('/table-occupancy', dashboardController.getTableOccupancy);
router.get('/low-stock', dashboardController.getLowStockItems);
router.get('/purchase-summary', dashboardController.getPurchaseSummary);
router.get('/monthly-expense', dashboardController.getMonthlyExpenses);
router.get('/supplier-summary', dashboardController.getSupplierSummary);
router.get('/top-selling-menu', dashboardController.getTopSellingMenu);
router.get('/weekly-sales', dashboardController.getWeeklySales);
router.get('/monthly-sales', dashboardController.getMonthlySales);
router.get('/yearly-sales', dashboardController.getYearlySales);

module.exports = router;
