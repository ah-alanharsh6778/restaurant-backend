const prisma = require('../../config/prisma');

class ActivityLogRepository {
  async logActivity(data) {
    return prisma.activityLog.create({ data });
  }

  async findAll(options = {}) {
    const { skip, take, userId, module: mod, action } = options;
    const where = {};
    if (userId) where.userId = userId;
    if (mod) where.module = mod;
    if (action) where.action = action;

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { user: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.activityLog.count({ where })
    ]);

    return { items, total };
  }
}

module.exports = new ActivityLogRepository();
