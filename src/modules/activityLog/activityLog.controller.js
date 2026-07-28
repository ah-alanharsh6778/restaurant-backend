const asyncHandler = require('../../utils/asyncHandler');
const activityLogService = require('./activityLog.service');

const getAllActivityLogs = asyncHandler(async (req, res) => {
  const result = await activityLogService.getAllActivityLogs(req.query);
  return res.status(200).json({
    success: true,
    data: result.activityLogs,
    pagination: result.pagination
  });
});

module.exports = {
  getAllActivityLogs
};
