const express = require('express');
const roleController = require('./role.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const { createRoleValidation, updateRoleValidation } = require('./role.validation');

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN'), createRoleValidation, roleController.createRole);
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), roleController.getAllRoles);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), roleController.getRoleById);
router.put('/:id', authorizeRoles('ADMIN'), updateRoleValidation, roleController.updateRole);
router.delete('/:id', authorizeRoles('ADMIN'), roleController.deleteRole);

module.exports = router;
