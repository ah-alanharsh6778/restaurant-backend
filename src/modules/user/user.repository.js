const prisma = require('../../config/prisma');

class UserRepository {
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true, staff: true }
    });
  }

  async findAll(options = {}) {
    const { skip, take, roleId, isActive } = options;
    const where = {};
    if (roleId) where.roleId = roleId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { role: true, staff: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return { items, total };
  }

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      include: { role: true, staff: true }
    });
  }

  async softDelete(id) {
    return prisma.user.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), isActive: false }
    });
  }
}

module.exports = new UserRepository();
