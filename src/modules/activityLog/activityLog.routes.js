const express = require('express');
const activityLogController = require('./activityLog.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

router.get('/', activityLogController.getAllActivityLogs);

module.exports = router;
