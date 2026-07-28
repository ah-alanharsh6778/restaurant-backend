const prisma = require('../../config/prisma');

class NotificationRepository {
  async create(data) {
    return prisma.notification.create({ data });
  }

  async findByUserId(userId, options = {}) {
    const { skip, take, isRead } = options;
    const where = { userId };
    if (isRead !== undefined) where.isRead = isRead === 'true';

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);

    return { items, total };
  }

  async markAsRead(id) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }
}

module.exports = new NotificationRepository();
