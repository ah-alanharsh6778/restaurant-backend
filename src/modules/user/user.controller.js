const asyncHandler = require('../../utils/asyncHandler');
const { getUserProfile, getAllUsers } = require('./user.service');

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await getUserProfile(userId);
  return res.status(200).json({
    success: true,
    data: user
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsers();
  return res.status(200).json({
    success: true,
    data: users
  });
});

module.exports = {
  getProfile,
  getUsers
};
