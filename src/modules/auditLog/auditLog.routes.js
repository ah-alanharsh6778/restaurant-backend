const express = require('express');
const auditLogController = require('./auditLog.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

router.get('/', auditLogController.getAllAuditLogs);

module.exports = router;
