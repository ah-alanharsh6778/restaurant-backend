const asyncHandler = require('../../utils/asyncHandler');
const aiService = require('./ai.service');

const getStockPredictions = asyncHandler(async (req, res) => {
  const predictions = await aiService.predictStockConsumption();
  return res.status(200).json({
    success: true,
    data: predictions
  });
});

const getMenuPricingRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await aiService.optimizeMenuPricing();
  return res.status(200).json({
    success: true,
    data: recommendations
  });
});

const getFoodWasteAnalysis = asyncHandler(async (req, res) => {
  const wasteAnalysis = await aiService.calculateFoodWasteMetrics();
  return res.status(200).json({
    success: true,
    data: wasteAnalysis
  });
});

const getPrepTimeEstimate = asyncHandler(async (req, res) => {
  const { orderId } = req.query;
  const estimate = await aiService.estimatePreparationTime(orderId);
  return res.status(200).json({
    success: true,
    data: estimate
  });
});

module.exports = {
  getStockPredictions,
  getMenuPricingRecommendations,
  getFoodWasteAnalysis,
  getPrepTimeEstimate
};
