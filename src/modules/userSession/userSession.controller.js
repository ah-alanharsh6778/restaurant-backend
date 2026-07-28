const asyncHandler = require('../../utils/asyncHandler');
const userSessionService = require('./userSession.service');

const getAllSessions = asyncHandler(async (req, res) => {
  const result = await userSessionService.getAllSessions(req.query);
  return res.status(200).json({
    success: true,
    data: result.sessions,
    pagination: result.pagination
  });
});

const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await userSessionService.getUserSessions(req.user.id);
  return res.status(200).json({
    success: true,
    data: sessions
  });
});

const revokeSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await userSessionService.revokeSession(id);
  return res.status(200).json({
    success: true,
    message: 'User session revoked successfully'
  });
});

const revokeAllUserSessions = asyncHandler(async (req, res) => {
  const userId = req.body.userId || req.user.id;
  await userSessionService.revokeAllUserSessions(userId);
  return res.status(200).json({
    success: true,
    message: 'All user sessions revoked successfully'
  });
});

module.exports = {
  getAllSessions,
  getMySessions,
  revokeSession,
  revokeAllUserSessions
};
