const permissionRepository = require('./permission.repository');
const prisma = require('../../config/prisma');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

const createPermission = async (data) => {
  const { name, action, resource, description } = data;

  const existing = await permissionRepository.findByName(name);
  if (existing) throw new BadRequestError(`Permission '${name}' already exists`);

  return permissionRepository.create({
    name,
    action: action.toUpperCase(),
    resource: resource.toUpperCase(),
    description: description || null
  });
};

const getAllPermissions = async (query = {}) => {
  const { page = 1, limit = 50, resource, action } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await permissionRepository.findAll({ skip, take, resource, action });

  return {
    permissions: items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const assignPermissionToRole = async (data) => {
  const { roleId, permissionId } = data;

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new NotFoundError('Role not found');

  const perm = await permissionRepository.findById(permissionId);
  if (!perm) throw new NotFoundError('Permission not found');

  return permissionRepository.assignPermissionToRole(roleId, permissionId);
};

const getRolePermissions = async (roleId) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new NotFoundError('Role not found');

  const rolePerms = await permissionRepository.findRolePermissions(roleId);
  return rolePerms.map((rp) => rp.permission);
};

module.exports = {
  createPermission,
  getAllPermissions,
  assignPermissionToRole,
  getRolePermissions
};
