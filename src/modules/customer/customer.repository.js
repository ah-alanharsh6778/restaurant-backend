const prisma = require('../../config/prisma');

class CustomerRepository {
  async create(data) {
    return prisma.customer.create({ data });
  }

  async findById(id) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            payments: true,
            orderItems: {
              include: { menuItem: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        tables: {
          select: { id: true, tableNumber: true, status: true, capacity: true },
        },
        reservations: {
          include: {
            table: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByPhone(phone) {
    return prisma.customer.findFirst({
      where: {
        phone: String(phone).trim(),
        isDeleted: false,
      },
      include: {
        tables: true,
        reservations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findByEmail(email) {
    return prisma.customer.findFirst({
      where: {
        email: String(email).trim(),
        isDeleted: false,
      },
    });
  }

  async findAll(options = {}) {
    const { skip, take, search } = options;
    const where = { isDeleted: false };

    if (search) {
      where.AND = [
        { isDeleted: false },
        {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          orders: {
            select: { id: true, orderNumber: true, finalAmount: true, status: true, createdAt: true },
          },
          tables: {
            select: { id: true, tableNumber: true, status: true },
          },
          reservations: {
            select: {
              id: true,
              status: true,
              bookingDate: true,
              bookingTime: true,
              guestCount: true,
              table: { select: { id: true, tableNumber: true, status: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return { items, total };
  }

  async update(id, data) {
    return prisma.customer.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.customer.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}

module.exports = new CustomerRepository();
