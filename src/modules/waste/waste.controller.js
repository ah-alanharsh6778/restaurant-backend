const asyncHandler = require('../../utils/asyncHandler');
const wasteService = require('./waste.service');

const logFoodWaste = asyncHandler(async (req, res) => {
  const wasteLog = await wasteService.logFoodWaste(req.body, req.user);
  return res.status(201).json({
    success: true,
    message: 'Food waste logged successfully',
    data: wasteLog
  });
});

const getAllWasteLogs = asyncHandler(async (req, res) => {
  const result = await wasteService.getAllWasteLogs(req.query);
  return res.status(200).json({
    success: true,
    data: result.wasteLogs,
    pagination: result.pagination
  });
});

const getWasteStats = asyncHandler(async (req, res) => {
  const stats = await wasteService.getWasteStats();
  return res.status(200).json({
    success: true,
    data: stats
  });
});

module.exports = {
  logFoodWaste,
  getAllWasteLogs,
  getWasteStats
};
