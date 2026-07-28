const asyncHandler = require('../../utils/asyncHandler');
const { registerUser, loginUser, refreshAccessToken } = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);
  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: user
  });
});

const login = asyncHandler(async (req, res) => {
  const metadata = {
    ip: req.ip || req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent'],
    device: 'Desktop/Mobile',
    browser: req.headers['user-agent'] ? req.headers['user-agent'].split(' ')[0] : 'Unknown'
  };

  const result = await loginUser(req.body, metadata);
  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await refreshAccessToken(refreshToken);
  return res.status(200).json({
    success: true,
    message: 'Tokens refreshed successfully',
    data: result
  });
});

module.exports = {
  register,
  login,
  refresh
};
