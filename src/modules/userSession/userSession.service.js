const userSessionRepository = require('./userSession.repository');
const { NotFoundError } = require('../../utils/errors');

const getAllSessions = async (query = {}) => {
  const { page = 1, limit = 50, isExpired } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await userSessionRepository.findAll({ skip, take, isExpired });

  return {
    sessions: items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getUserSessions = async (userId) => {
  return userSessionRepository.findByUserId(userId);
};

const revokeSession = async (id) => {
  return userSessionRepository.revokeSession(id);
};

const revokeAllUserSessions = async (userId) => {
  await userSessionRepository.revokeAllUserSessions(userId);
  return { userId };
};

module.exports = {
  getAllSessions,
  getUserSessions,
  revokeSession,
  revokeAllUserSessions
};
