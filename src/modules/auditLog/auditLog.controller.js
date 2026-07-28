const asyncHandler = require('../../utils/asyncHandler');
const auditLogService = require('./auditLog.service');

const getAllAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditLogService.getAllAuditLogs(req.query);
  return res.status(200).json({
    success: true,
    data: result.auditLogs,
    pagination: result.pagination
  });
});

module.exports = {
  getAllAuditLogs
};
