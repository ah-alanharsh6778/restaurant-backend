const asyncHandler = require('../../utils/asyncHandler');
const roleService = require('./role.service');

const createRole = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.body);
  return res.status(201).json({
    success: true,
    message: 'Role created successfully',
    data: role
  });
});

const getAllRoles = asyncHandler(async (req, res) => {
  const result = await roleService.getAllRoles(req.query);
  return res.status(200).json({
    success: true,
    data: result.roles,
    pagination: result.pagination
  });
});

const getRoleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await roleService.getRoleById(id);
  return res.status(200).json({
    success: true,
    data: role
  });
});

const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await roleService.updateRole(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Role updated successfully',
    data: role
  });
});

const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await roleService.deleteRole(id);
  return res.status(200).json({
    success: true,
    message: 'Role deleted successfully'
  });
});

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
};
