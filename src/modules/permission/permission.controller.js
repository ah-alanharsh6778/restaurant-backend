const asyncHandler = require('../../utils/asyncHandler');
const permissionService = require('./permission.service');

const createPermission = asyncHandler(async (req, res) => {
  const permission = await permissionService.createPermission(req.body);
  return res.status(201).json({
    success: true,
    message: 'Permission created successfully',
    data: permission
  });
});

const getAllPermissions = asyncHandler(async (req, res) => {
  const result = await permissionService.getAllPermissions(req.query);
  return res.status(200).json({
    success: true,
    data: result.permissions,
    pagination: result.pagination
  });
});

const assignPermissionToRole = asyncHandler(async (req, res) => {
  const rolePermission = await permissionService.assignPermissionToRole(req.body);
  return res.status(200).json({
    success: true,
    message: 'Permission assigned to role successfully',
    data: rolePermission
  });
});

const getRolePermissions = asyncHandler(async (req, res) => {
  const { roleId } = req.params;
  const permissions = await permissionService.getRolePermissions(roleId);
  return res.status(200).json({
    success: true,
    data: permissions
  });
});

module.exports = {
  createPermission,
  getAllPermissions,
  assignPermissionToRole,
  getRolePermissions
};
