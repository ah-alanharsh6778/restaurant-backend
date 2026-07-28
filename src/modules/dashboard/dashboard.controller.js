const asyncHandler = require('../../utils/asyncHandler');
const dashboardService = require('./dashboard.service');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getDashboardSummary();
  return res.status(200).json({ success: true, data: summary });
});

const getSalesOverview = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSalesOverview();
  return res.status(200).json({ success: true, data });
});

const getOrdersBreakdown = asyncHandler(async (req, res) => {
  const data = await dashboardService.getOrdersBreakdown();
  return res.status(200).json({ success: true, data });
});

const getRevenueMetrics = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRevenueMetrics();
  return res.status(200).json({ success: true, data });
});

const getProfitMetrics = asyncHandler(async (req, res) => {
  const data = await dashboardService.getProfitMetrics();
  return res.status(200).json({ success: true, data });
});

const getTableOccupancy = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTableOccupancy();
  return res.status(200).json({ success: true, data });
});

const getLowStockItems = asyncHandler(async (req, res) => {
  const data = await dashboardService.getLowStockItems();
  return res.status(200).json({ success: true, data });
});

const getPurchaseSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getPurchaseSummary();
  return res.status(200).json({ success: true, data });
});

const getMonthlyExpenses = asyncHandler(async (req, res) => {
  const data = await dashboardService.getMonthlyExpenses();
  return res.status(200).json({ success: true, data });
});

const getSupplierSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSupplierSummary();
  return res.status(200).json({ success: true, data });
});

const getTopSellingMenu = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
  const data = await dashboardService.getTopSellingMenu(limit);
  return res.status(200).json({ success: true, data });
});

const getWeeklySales = asyncHandler(async (req, res) => {
  const data = await dashboardService.getWeeklySales();
  return res.status(200).json({ success: true, data });
});

const getMonthlySales = asyncHandler(async (req, res) => {
  const data = await dashboardService.getMonthlySales();
  return res.status(200).json({ success: true, data });
});

const getYearlySales = asyncHandler(async (req, res) => {
  const data = await dashboardService.getYearlySales();
  return res.status(200).json({ success: true, data });
});

module.exports = {
  getDashboardSummary,
  getSalesOverview,
  getOrdersBreakdown,
  getRevenueMetrics,
  getProfitMetrics,
  getTableOccupancy,
  getLowStockItems,
  getPurchaseSummary,
  getMonthlyExpenses,
  getSupplierSummary,
  getTopSellingMenu,
  getWeeklySales,
  getMonthlySales,
  getYearlySales
};
