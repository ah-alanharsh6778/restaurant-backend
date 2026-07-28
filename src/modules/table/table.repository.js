const prisma = require('../../config/prisma');

class TableRepository {
  async create(data) {
    return prisma.restaurantTable.create({
      data
    });
  }

  async findById(id) {
    return prisma.restaurantTable.findUnique({
      where: { id },
      include: {
        orders: true
      }
    });
  }

  async findByTableNumber(tableNumber) {
    return prisma.restaurantTable.findUnique({
      where: { tableNumber }
    });
  }

  async findAll(options = {}) {
    const { skip, take, status } = options;
    const where = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.restaurantTable.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        orderBy: { tableNumber: 'asc' }
      }),
      prisma.restaurantTable.count({ where })
    ]);

    return { items, total };
  }

  async update(id, data) {
    return prisma.restaurantTable.update({
      where: { id },
      data
    });
  }

  async getAvailabilityStats() {
    const [total, available, occupied, reserved, maintenance] = await Promise.all([
      prisma.restaurantTable.count(),
      prisma.restaurantTable.count({ where: { status: 'AVAILABLE' } }),
      prisma.restaurantTable.count({ where: { status: 'OCCUPIED' } }),
      prisma.restaurantTable.count({ where: { status: 'RESERVED' } }),
      prisma.restaurantTable.count({ where: { status: 'MAINTENANCE' } })
    ]);

    return { total, available, occupied, reserved, maintenance };
  }

  async updateStatus(id, status) {
    return prisma.restaurantTable.update({
      where: { id },
      data: { status }
    });
  }

  async delete(id) {
    return prisma.restaurantTable.delete({
      where: { id }
    });
  }
}

module.exports = new TableRepository();
