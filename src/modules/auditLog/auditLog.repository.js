const prisma = require('../../config/prisma');

class AuditLogRepository {
  async logAudit(data) {
    return prisma.auditLog.create({ data });
  }

  async findAll(options = {}) {
    const { skip, take, userId, entityName, action } = options;
    const where = {};
    if (userId) where.userId = userId;
    if (entityName) where.entityName = entityName;
    if (action) where.action = action;

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { user: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ]);

    return { items, total };
  }
}

module.exports = new AuditLogRepository();
