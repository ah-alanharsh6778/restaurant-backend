const activityLogRepository = require('./activityLog.repository');

const getAllActivityLogs = async (query = {}) => {
  const { page = 1, limit = 50, userId, module: mod, action } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await activityLogRepository.findAll({ skip, take, userId, module: mod, action });

  return {
    activityLogs: items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

module.exports = {
  getAllActivityLogs
};
