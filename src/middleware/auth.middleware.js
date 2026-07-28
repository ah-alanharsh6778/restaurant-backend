const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../utils/errors');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    }
    return next(new UnauthorizedError('Invalid or expired access token'));
  }
};

module.exports = authenticateToken;
