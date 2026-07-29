const prisma = require('../../config/prisma');

class TableRepository {
  async create(data) {
    return prisma.restaurantTable.create({
      data,
      include: {
        customer: true,
        reservations: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        orders: {
          where: { isDeleted: false, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findById(id) {
    return prisma.restaurantTable.findUnique({
      where: { id },
      include: {
        customer: true,
        reservations: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        orders: {
          where: { isDeleted: false, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findByTableNumber(tableNumber) {
    return prisma.restaurantTable.findUnique({
      where: { tableNumber },
      include: {
        customer: true,
        reservations: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        orders: {
          where: { isDeleted: false, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
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
        orderBy: { tableNumber: 'asc' },
        include: {
          customer: true,
          reservations: {
            where: { isDeleted: false, status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          orders: {
            where: { isDeleted: false, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.restaurantTable.count({ where }),
    ]);

    return { items, total };
  }

  async update(id, data) {
    return prisma.restaurantTable.update({
      where: { id },
      data,
      include: {
        customer: true,
        reservations: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        orders: {
          where: { isDeleted: false, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getAvailabilityStats() {
    const [total, available, occupied, reserved, maintenance] = await Promise.all([
      prisma.restaurantTable.count(),
      prisma.restaurantTable.count({ where: { status: 'AVAILABLE' } }),
      prisma.restaurantTable.count({ where: { status: 'OCCUPIED' } }),
      prisma.restaurantTable.count({ where: { status: 'RESERVED' } }),
      prisma.restaurantTable.count({ where: { status: 'MAINTENANCE' } }),
    ]);

    return { total, available, occupied, reserved, maintenance };
  }

  async updateStatus(id, status) {
    return prisma.restaurantTable.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        reservations: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        orders: {
          where: { isDeleted: false, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async delete(id) {
    return prisma.restaurantTable.delete({
      where: { id },
    });
  }

  // Reservation Helper Methods
  async createReservation(data) {
    return prisma.reservation.create({
      data,
      include: {
        customer: true,
        table: true,
      },
    });
  }

  async findActiveReservation(tableId) {
    return prisma.reservation.findFirst({
      where: {
        tableId,
        isDeleted: false,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
      },
    });
  }

  async updateReservationStatus(reservationId, status) {
    return prisma.reservation.update({
      where: { id: reservationId },
      data: { status },
    });
  }
}

module.exports = new TableRepository();
