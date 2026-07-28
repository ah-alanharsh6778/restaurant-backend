const express = require('express');
const userController = require('./user.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');

const router = express.Router();

router.get('/profile', authenticateToken, userController.getProfile);
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), userController.getUsers);

module.exports = router;
