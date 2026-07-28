const dashboardRepository = require('./dashboard.repository');
const cache = require('../../utils/cache');

const getCachedOrFetch = async (key, fetchFn, ttlMs = 60000) => {
  const cachedData = cache.get(key);
  if (cachedData) return cachedData;

  const freshData = await fetchFn();
  cache.set(key, freshData, ttlMs);
  return freshData;
};

const getSalesOverview = () => getCachedOrFetch('dashboard:sales-overview', () => dashboardRepository.getSalesOverview());
const getOrdersBreakdown = () => getCachedOrFetch('dashboard:orders-breakdown', () => dashboardRepository.getOrdersBreakdown());
const getRevenueMetrics = () => getCachedOrFetch('dashboard:revenue', () => dashboardRepository.getRevenueMetrics());
const getProfitMetrics = () => getCachedOrFetch('dashboard:profit', () => dashboardRepository.getProfitMetrics());
const getTableOccupancy = () => getCachedOrFetch('dashboard:table-occupancy', () => dashboardRepository.getTableOccupancy());
const getLowStockItems = () => getCachedOrFetch('dashboard:low-stock', () => dashboardRepository.getLowStockItems());
const getPurchaseSummary = () => getCachedOrFetch('dashboard:purchase-summary', () => dashboardRepository.getPurchaseSummary());
const getMonthlyExpenses = () => getCachedOrFetch('dashboard:monthly-expenses', () => dashboardRepository.getMonthlyExpenses());
const getSupplierSummary = () => getCachedOrFetch('dashboard:supplier-summary', () => dashboardRepository.getSupplierSummary());
const getTopSellingMenu = (limit) => getCachedOrFetch(`dashboard:top-selling:${limit || 5}`, () => dashboardRepository.getTopSellingMenu(limit));
const getWeeklySales = () => getCachedOrFetch('dashboard:weekly-sales', () => dashboardRepository.getWeeklySales());
const getMonthlySales = () => getCachedOrFetch('dashboard:monthly-sales', () => dashboardRepository.getMonthlySales());
const getYearlySales = () => getCachedOrFetch('dashboard:yearly-sales', () => dashboardRepository.getYearlySales());

const getDashboardSummary = async () => {
  const [salesOverview, ordersBreakdown, profitMetrics, tableOccupancy, lowStockAlerts] = await Promise.all([
    getSalesOverview(),
    getOrdersBreakdown(),
    getProfitMetrics(),
    getTableOccupancy(),
    getLowStockItems()
  ]);

  return {
    salesOverview,
    ordersBreakdown,
    profitMetrics,
    tableOccupancy,
    lowStockAlerts
  };
};

module.exports = {
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
  getYearlySales,
  getDashboardSummary
};
