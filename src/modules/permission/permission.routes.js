const express = require('express');
const permissionController = require('./permission.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const { createPermissionValidation, assignPermissionValidation } = require('./permission.validation');

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN'), createPermissionValidation, permissionController.createPermission);
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), permissionController.getAllPermissions);
router.post('/assign-role', authorizeRoles('ADMIN'), assignPermissionValidation, permissionController.assignPermissionToRole);
router.get('/role/:roleId', authorizeRoles('ADMIN', 'MANAGER'), permissionController.getRolePermissions);

module.exports = router;
