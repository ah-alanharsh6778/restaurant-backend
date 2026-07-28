const prisma = require('../../config/prisma');

class UserSessionRepository {
  async createSession(data) {
    return prisma.userSession.create({
      data,
      include: { user: true }
    });
  }

  async findByUserId(userId) {
    return prisma.userSession.findMany({
      where: { userId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAll(options = {}) {
    const { skip, take, isExpired } = options;
    const where = {};
    if (isExpired !== undefined) where.isExpired = isExpired === 'true';

    const [items, total] = await Promise.all([
      prisma.userSession.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { user: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userSession.count({ where })
    ]);

    return { items, total };
  }

  async revokeSession(id) {
    return prisma.userSession.update({
      where: { id },
      data: { isExpired: true }
    });
  }

  async revokeAllUserSessions(userId) {
    return prisma.userSession.updateMany({
      where: { userId },
      data: { isExpired: true }
    });
  }
}

module.exports = new UserSessionRepository();
