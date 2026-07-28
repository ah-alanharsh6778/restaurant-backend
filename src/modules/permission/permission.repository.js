const prisma = require('../../config/prisma');

class PermissionRepository {
  async create(data) {
    return prisma.permission.create({ data });
  }

  async findByName(name) {
    return prisma.permission.findUnique({ where: { name } });
  }

  async findById(id) {
    return prisma.permission.findUnique({
      where: { id },
      include: { rolePermissions: { include: { role: true } } }
    });
  }

  async findAll(options = {}) {
    const { skip, take, resource, action } = options;
    const where = {};
    if (resource) where.resource = resource;
    if (action) where.action = action;

    const [items, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        orderBy: { resource: 'asc' }
      }),
      prisma.permission.count({ where })
    ]);

    return { items, total };
  }

  async assignPermissionToRole(roleId, permissionId) {
    return prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId, permissionId }
      },
      update: {},
      create: { roleId, permissionId },
      include: { role: true, permission: true }
    });
  }

  async findRolePermissions(roleId) {
    return prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true }
    });
  }
}

module.exports = new PermissionRepository();
