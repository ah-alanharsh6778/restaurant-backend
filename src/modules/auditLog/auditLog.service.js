const auditLogRepository = require('./auditLog.repository');

const getAllAuditLogs = async (query = {}) => {
  const { page = 1, limit = 50, userId, entityName, action } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await auditLogRepository.findAll({ skip, take, userId, entityName, action });

  return {
    auditLogs: items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

module.exports = {
  getAllAuditLogs
};
