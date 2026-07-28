const express = require('express');
const staffController = require('./staff.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const { createStaffValidation, updateStaffValidation } = require('./staff.validation');

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createStaffValidation, staffController.createStaff);
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), staffController.getAllStaff);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), staffController.getStaffById);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateStaffValidation, staffController.updateStaff);
router.delete('/:id', authorizeRoles('ADMIN'), staffController.deleteStaff);

module.exports = router;
